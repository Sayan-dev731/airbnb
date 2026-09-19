import mongoose, { Schema } from "mongoose";
import {
  BOOKING_STATUS,
  AVAILABLE_BOOKING_STATUSES,
  PAYMENT_STATUS,
  AVAILABLE_PAYMENT_STATUSES,
} from "../utils/constants.js";

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Guest user is required"],
      index: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing is required"],
      index: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Host is required"],
      index: true,
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
      index: true,
    },
    nightsCount: {
      type: Number,
      required: true,
      min: 1,
    },
    guestsCount: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
      pets: { type: Number, default: 0, min: 0 },
    },
    pricingBreakdown: {
      basePricePerNight: { type: Number, required: true },
      baseTotal: { type: Number, required: true },
      discountAmount: { type: Number, default: 0 },
      cleaningFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    paymentStatus: {
      type: String,
      enum: AVAILABLE_PAYMENT_STATUSES,
      default: PAYMENT_STATUS.PAID,
    },
    paymentDetails: {
      paymentMethod: { type: String, default: "Credit Card / UPI" },
      transactionId: { type: String },
      paidAt: { type: Date, default: Date.now },
    },
    bookingStatus: {
      type: String,
      enum: AVAILABLE_BOOKING_STATUSES,
      default: BOOKING_STATUS.CONFIRMED,
      index: true,
    },
    cancellationReason: {
      type: String,
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly query overlapping bookings for a listing
bookingSchema.index({
  listing: 1,
  bookingStatus: 1,
  checkInDate: 1,
  checkOutDate: 1,
});

export const Booking = mongoose.model("Booking", bookingSchema);
