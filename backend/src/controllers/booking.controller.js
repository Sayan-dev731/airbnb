import mongoose from "mongoose";
import { Booking } from "../models/booking.model.js";
import { Listing } from "../models/listing.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
} from "../utils/constants.js";
import { sendBookingConfirmationEmail } from "../utils/mail.js";

/**
 * Helper: Calculate price breakdown for a stay
 */
export const calculateStayPricing = (listing, checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const nightsCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePricePerNight = listing.pricing?.basePrice || 3500;
  const discountPercent = listing.pricing?.discountPercentage || 0;

  const baseTotal = basePricePerNight * nightsCount;
  const discountAmount = Math.round((baseTotal * discountPercent) / 100);
  const discountedBaseTotal = baseTotal - discountAmount;

  const cleaningFee = listing.pricing?.cleaningFee || 0;
  const serviceFeePercent = listing.pricing?.serviceFeePercent || 12;
  const serviceFee = Math.round(
    (discountedBaseTotal * serviceFeePercent) / 100
  );
  const taxes = Math.round((discountedBaseTotal + serviceFee) * 0.18); // 18% GST standard
  const grandTotal = discountedBaseTotal + cleaningFee + serviceFee + taxes;

  return {
    nightsCount,
    nights: nightsCount,
    basePricePerNight,
    basePrice: basePricePerNight,
    baseTotal,
    stayTotal: discountedBaseTotal,
    discountAmount,
    weeklyDiscount: discountAmount,
    discountPercentage: discountPercent,
    cleaningFee,
    serviceFee,
    taxes,
    grandTotal,
    totalAmount: grandTotal,
    currency: listing.pricing?.currency || "INR",
  };
};

/**
 * @desc    Check availability and calculate pricing breakdown for dates
 * @route   POST /api/v1/bookings/check-price
 * @access  Public
 */
export const checkPriceAndAvailability = asyncHandler(async (req, res) => {
  const { listingId, checkInDate, checkOutDate, guests = 1 } = req.body;

  if (!listingId || !checkInDate || !checkOutDate) {
    throw new ApiError(400, "Listing ID, check-in, and check-out dates are required");
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkIn >= checkOut) {
    throw new ApiError(400, "Check-out date must be after check-in date");
  }

  // Check guest capacity
  if (Number(guests) > listing.capacity.guests) {
    throw new ApiError(
      400,
      `Listing max capacity is ${listing.capacity.guests} guests`
    );
  }

  // Check if dates conflict with existing active bookings
  const conflictingBooking = await Booking.findOne({
    listing: listingId,
    bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
    $or: [
      {
        checkInDate: { $lte: checkIn },
        checkOutDate: { $gt: checkIn },
      },
      {
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gte: checkOut },
      },
      {
        checkInDate: { $gte: checkIn },
        checkOutDate: { $lte: checkOut },
      },
    ],
  });

  const isAvailable = !conflictingBooking;
  const pricing = calculateStayPricing(listing, checkInDate, checkOutDate);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isAvailable,
        pricing,
        listing: {
          _id: listing._id,
          title: listing.title,
          coverPhoto: listing.coverPhoto,
          location: listing.location,
        },
      },
      isAvailable
        ? "Dates are available for booking"
        : "Selected dates are already booked. Please pick other dates."
    )
  );
});

/**
 * @desc    Create a new booking reservation
 * @route   POST /api/v1/bookings
 * @access  Protected
 */
export const createBooking = asyncHandler(async (req, res) => {
  const {
    listingId,
    checkInDate,
    checkOutDate,
    adults = 1,
    children = 0,
    infants = 0,
    pets = 0,
    specialRequests,
    paymentMethod = "Card",
  } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Prevent host from booking their own listing
  if (listing.host.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot book your own property");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const totalGuests = Number(adults) + Number(children);

  if (totalGuests > listing.capacity.guests) {
    throw new ApiError(
      400,
      `Total guests exceed listing capacity of ${listing.capacity.guests}`
    );
  }

  // Atomic conflict check
  const conflictingBooking = await Booking.findOne({
    listing: listingId,
    bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
    $or: [
      {
        checkInDate: { $lte: checkIn },
        checkOutDate: { $gt: checkIn },
      },
      {
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gte: checkOut },
      },
      {
        checkInDate: { $gte: checkIn },
        checkOutDate: { $lte: checkOut },
      },
    ],
  });

  if (conflictingBooking) {
    throw new ApiError(
      409,
      "The selected dates are no longer available. Please select different dates."
    );
  }

  const pricing = calculateStayPricing(listing, checkInDate, checkOutDate);

  const booking = await Booking.create({
    user: req.user._id,
    listing: listing._id,
    host: listing.host,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    nightsCount: pricing.nightsCount,
    guestsCount: {
      adults: Number(adults),
      children: Number(children),
      infants: Number(infants),
      pets: Number(pets),
    },
    pricingBreakdown: {
      basePricePerNight: pricing.basePricePerNight,
      baseTotal: pricing.baseTotal,
      discountAmount: pricing.discountAmount,
      cleaningFee: pricing.cleaningFee,
      serviceFee: pricing.serviceFee,
      taxes: pricing.taxes,
      grandTotal: pricing.grandTotal,
      currency: pricing.currency,
    },
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentDetails: {
      paymentMethod,
      transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      paidAt: new Date(),
    },
    bookingStatus: BOOKING_STATUS.CONFIRMED,
    specialRequests,
  });

  // Send confirmation email asynchronously
  sendBookingConfirmationEmail(req.user, booking, listing).catch((err) =>
    console.error("Booking confirmation email error:", err)
  );

  const populatedBooking = await Booking.findById(booking._id)
    .populate("listing", "title coverPhoto location propertyType")
    .populate("host", "name email phone avatar");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populatedBooking,
        "Booking reservation confirmed successfully!"
      )
    );
});

/**
 * @desc    Get all bookings of logged-in user (Trips)
 * @route   GET /api/v1/bookings/my-trips
 * @access  Protected
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing", "title coverPhoto location pricing ratingsSummary propertyType")
    .populate("host", "name avatar isSuperHost")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, bookings, "User trips retrieved successfully")
    );
});

/**
 * @desc    Get host reservations
 * @route   GET /api/v1/bookings/host/reservations
 * @access  Protected (Host / Admin)
 */
export const getHostReservations = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role !== USER_ROLES.ADMIN) {
    const hostListings = await Listing.find({ host: req.user._id }).select("_id");
    const listingIds = hostListings.map((l) => l._id);
    filter = {
      $or: [
        { host: req.user._id },
        { listing: { $in: listingIds } },
      ],
    };
  }
  const bookings = await Booking.find(filter)
    .populate("listing", "title coverPhoto photos location pricing propertyType")
    .populate("user", "name email phone avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        bookings,
        "Host reservations retrieved successfully"
      )
    );
});

/**
 * @desc    Get booking details by ID
 * @route   GET /api/v1/bookings/:bookingId
 * @access  Protected
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("listing")
    .populate("host", "name email phone avatar")
    .populate("user", "name email phone avatar");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Authorization: Only booking owner, host, or admin
  const isOwner = booking.user._id.toString() === req.user._id.toString();
  const isHost = booking.host._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isOwner && !isHost && !isAdmin) {
    throw new ApiError(
      403,
      "Forbidden: You do not have access to view this reservation"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking details retrieved successfully"));
});

/**
 * @desc    Cancel a booking
 * @route   PATCH /api/v1/bookings/:bookingId/cancel
 * @access  Protected
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const isOwner = booking.user.toString() === req.user._id.toString();
  const isHost = booking.host.toString() === req.user._id.toString();
  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isOwner && !isHost && !isAdmin) {
    throw new ApiError(403, "Forbidden: You cannot cancel this booking");
  }

  booking.bookingStatus = BOOKING_STATUS.CANCELLED;
  booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
  booking.cancellationReason = reason || "Cancelled by user";
  await booking.save();

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});
