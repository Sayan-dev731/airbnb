import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["captured", "authorized", "failed", "refunded", "processing"],
      default: "captured",
      index: true,
    },
    paymentMethod: {
      type: {
        type: String,
        enum: ["card", "upi", "netbanking", "saved_method"],
        default: "card",
      },
      brand: String,
      last4: String,
      cardholderName: String,
      maskedVpa: String,
      bankName: String,
    },
    pricingBreakdown: {
      basePricePerNight: Number,
      nightsCount: Number,
      baseTotal: Number,
      discountPercentage: Number,
      discountAmount: Number,
      discountedBaseTotal: Number,
      cleaningFee: Number,
      serviceFee: Number,
      taxes: Number,
      grandTotal: Number,
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    gatewayResponse: {
      authCode: String,
      settlementStatus: String,
      riskScore: {
        type: String,
        default: "low",
      },
      processedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);
