import crypto from "crypto";
import { Payment } from "../models/payment.model.js";
import { PaymentMethod } from "../models/paymentMethod.model.js";
import { Booking } from "../models/booking.model.js";
import { Listing } from "../models/listing.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  sendBookingConfirmationEmail,
  sendPaymentInvoiceEmail,
} from "../utils/mail.js";

/**
 * Helper to compute price breakdown securely
 */
const calculatePricing = (listing, checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new ApiError(400, "Invalid check-in or check-out date format");
  }

  if (checkOut <= checkIn) {
    throw new ApiError(400, "Check-out date must be after check-in date");
  }

  const diffTime = Math.abs(checkOut - checkIn);
  const nightsCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePricePerNight = listing.pricing?.basePrice || 1868;
  const baseTotal = basePricePerNight * nightsCount;

  // Apply weekly discount if stays >= 7 nights
  const discountPercentage =
    nightsCount >= 7 ? listing.pricing?.discountPercentage || 10 : 0;
  const discountAmount = Math.round((baseTotal * discountPercentage) / 100);
  const discountedBaseTotal = baseTotal - discountAmount;

  const cleaningFee = listing.pricing?.cleaningFee || 500;
  const serviceFee = Math.round(discountedBaseTotal * 0.12);
  const taxes = Math.round((discountedBaseTotal + serviceFee) * 0.18); // 18% GST
  const grandTotal = discountedBaseTotal + cleaningFee + serviceFee + taxes;

  return {
    basePricePerNight,
    basePrice: basePricePerNight,
    nightsCount,
    nights: nightsCount,
    baseTotal,
    discountPercentage,
    discountAmount,
    weeklyDiscount: discountAmount,
    discountedBaseTotal,
    stayTotal: discountedBaseTotal,
    cleaningFee,
    serviceFee,
    taxes,
    grandTotal,
    totalAmount: grandTotal,
  };
};

/**
 * @desc    Process payment and book reservation (Dummy Gateway with DB Debouncing & Idempotency)
 * @route   POST /api/v1/payments/process-and-book
 * @access  Private
 */
export const processPaymentAndBook = asyncHandler(async (req, res) => {
  const {
    listingId,
    checkInDate,
    checkOutDate,
    specialRequests,
    paymentMethod,
    idempotencyKey,
  } = req.body;

  const adults = Number(req.body.adults) || Number(req.body.guests?.adults) || 1;
  const children = Number(req.body.children) || Number(req.body.guests?.children) || 0;
  const infants = Number(req.body.infants) || Number(req.body.guests?.infants) || 0;
  const pets = Number(req.body.pets) || Number(req.body.guests?.pets) || 0;

  const userId = req.user._id;

  // 1. Idempotency Check (Debouncing & Preventing Duplicate Payments)
  if (idempotencyKey) {
    const existingPayment = await Payment.findOne({
      idempotencyKey,
      user: userId,
    })
      .populate("booking")
      .populate("listing");

    if (existingPayment) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            payment: existingPayment,
            booking: existingPayment.booking,
            isDuplicateSuppressed: true,
          },
          "Payment already processed (Idempotent response)"
        )
      );
    }
  }

  // 2. Validate Listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (!listing.isPublished) {
    throw new ApiError(400, "This listing is currently not available for booking");
  }

  // 3. Collision Check for Dates
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const overlappingBooking = await Booking.findOne({
    listing: listingId,
    bookingStatus: { $in: ["confirmed", "pending"] },
    $or: [
      { checkInDate: { $lte: checkIn }, checkOutDate: { $gt: checkIn } },
      { checkInDate: { $lt: checkOut }, checkOutDate: { $gte: checkOut } },
      { checkInDate: { $gte: checkIn }, checkOutDate: { $lte: checkOut } },
    ],
  });

  if (overlappingBooking) {
    throw new ApiError(
      409,
      "These dates are already booked. Please choose alternative dates."
    );
  }

  // 4. Compute Accurate Pricing Breakdown
  const pricingBreakdown = calculatePricing(listing, checkInDate, checkOutDate);

  // 5. Simulate Dummy Gateway Authorization & Mask Payment Details
  const methodType = paymentMethod?.type || "card";
  let paymentMethodSummary = {
    type: methodType,
    brand: "visa",
    last4: "4242",
    cardholderName: req.user.name,
    maskedVpa: "",
    bankName: "",
  };

  if (methodType === "card") {
    const rawNumber = String(paymentMethod?.cardNumber || "4242424242424242").replace(/\s+/g, "");
    const last4 = rawNumber.slice(-4) || "4242";
    const brand = PaymentMethod.detectCardBrand(rawNumber);
    const cardholderName = paymentMethod?.cardholderName || req.user.name;

    paymentMethodSummary = {
      type: "card",
      brand,
      last4,
      cardholderName,
    };

    // Save payment method securely if requested
    if (paymentMethod?.saveMethod) {
      const fingerprint = PaymentMethod.generateCardFingerprint(rawNumber);
      const existingMethod = await PaymentMethod.findOne({
        user: userId,
        "card.cardFingerprint": fingerprint,
      });

      if (!existingMethod) {
        await PaymentMethod.create({
          user: userId,
          type: "card",
          card: {
            brand,
            last4,
            expMonth: Number(paymentMethod?.expMonth) || 12,
            expYear: Number(paymentMethod?.expYear) || 2028,
            cardholderName,
            cardFingerprint: fingerprint,
            gatewayToken: `tok_live_${crypto.randomBytes(12).toString("hex")}`,
          },
          isDefault: true,
        });
      }
    }
  } else if (methodType === "upi") {
    const vpa = paymentMethod?.upiId || "user@okhdfcbank";
    const maskedVpa = vpa.replace(/(.{2})(.*)(@.*)/, "$1***$3");
    paymentMethodSummary = {
      type: "upi",
      maskedVpa,
    };

    if (paymentMethod?.saveMethod) {
      await PaymentMethod.create({
        user: userId,
        type: "upi",
        upi: { vpa, maskedVpa },
      });
    }
  } else if (methodType === "netbanking") {
    paymentMethodSummary = {
      type: "netbanking",
      bankName: paymentMethod?.bankName || "HDFC Bank",
    };
  } else if (methodType === "saved_method" && paymentMethod?.savedMethodId) {
    const saved = await PaymentMethod.findOne({
      _id: paymentMethod.savedMethodId,
      user: userId,
    });
    if (saved) {
      paymentMethodSummary = {
        type: saved.type,
        brand: saved.card?.brand || "visa",
        last4: saved.card?.last4 || "4242",
        cardholderName: saved.card?.cardholderName || req.user.name,
        maskedVpa: saved.upi?.maskedVpa,
        bankName: saved.netbanking?.bankName,
      };
    }
  }

  // Generate Unique Transaction ID and Receipt Number
  const transactionId = `txn_air_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // 6. Create Booking Record
  const booking = new Booking({
    listing: listingId,
    user: userId,
    host: listing.host?._id || listing.host,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    nightsCount: pricingBreakdown.nightsCount,
    guestsCount: {
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      infants: Number(infants) || 0,
      pets: Number(pets) || 0,
    },
    pricingBreakdown,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    paymentDetails: {
      paymentMethod: methodType === "card" ? "Credit/Debit Card" : methodType.toUpperCase(),
      transactionId,
      paidAt: new Date(),
    },
    specialRequests,
  });

  await booking.save();

  // 7. Create Payment Transaction Record
  const payment = new Payment({
    booking: booking._id,
    user: userId,
    listing: listingId,
    transactionId,
    idempotencyKey: idempotencyKey || transactionId,
    amount: pricingBreakdown.grandTotal,
    currency: "INR",
    status: "captured",
    paymentMethod: paymentMethodSummary,
    pricingBreakdown,
    receiptNumber,
    gatewayResponse: {
      authCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
      settlementStatus: "settled",
      riskScore: "low",
      processedAt: new Date(),
    },
  });

  await payment.save();

  // Link payment back to booking
  booking.payment = payment._id;
  await booking.save();

  // 8. Send Branded Confirmation & Invoice Emails Asynchronously
  const user = await User.findById(userId);
  if (user) {
    sendBookingConfirmationEmail(user, booking, listing).catch((err) =>
      console.error("Booking email dispatch error:", err)
    );
    sendPaymentInvoiceEmail(user, payment, booking, listing).catch((err) =>
      console.error("Payment invoice email dispatch error:", err)
    );
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        booking,
        payment,
        receiptNumber,
        transactionId,
      },
      "Payment processed and reservation confirmed successfully! Receipt has been sent to your email."
    )
  );
});

/**
 * @desc    Get user's saved payment methods
 * @route   GET /api/v1/payments/saved-methods
 * @access  Private
 */
export const getSavedPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, methods, "Saved payment methods retrieved"));
});

/**
 * @desc    Delete a saved payment method
 * @route   DELETE /api/v1/payments/saved-methods/:id
 * @access  Private
 */
export const deleteSavedPaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!method) {
    throw new ApiError(404, "Saved payment method not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Payment method removed successfully"));
});

/**
 * @desc    Get transaction receipt
 * @route   GET /api/v1/payments/:id/receipt
 * @access  Private
 */
export const getPaymentReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("booking")
    .populate("listing", "title location photos coverPhoto pricing");

  if (!payment) {
    throw new ApiError(404, "Payment receipt not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment receipt retrieved"));
});

/**
 * @desc    Get all user payment history
 * @route   GET /api/v1/payments/history
 * @access  Private
 */
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("listing", "title location coverPhoto")
    .populate("booking", "checkInDate checkOutDate nightsCount status")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payment history retrieved"));
});
