import mongoose from "mongoose";
import crypto from "crypto";

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["card", "upi", "netbanking"],
      required: true,
      default: "card",
    },
    card: {
      brand: {
        type: String,
        enum: ["visa", "mastercard", "amex", "rupay", "discover", "other"],
        default: "visa",
      },
      last4: {
        type: String,
        required: function () {
          return this.type === "card";
        },
      },
      expMonth: {
        type: Number,
        min: 1,
        max: 12,
      },
      expYear: {
        type: Number,
      },
      cardholderName: {
        type: String,
        trim: true,
      },
      // Fingerprint: SHA-256 hash of card number + salt to prevent duplicate storage without storing raw PAN
      cardFingerprint: {
        type: String,
        index: true,
      },
      // Encrypted token representing simulated gateway token
      gatewayToken: {
        type: String,
      },
    },
    upi: {
      vpa: {
        type: String,
        trim: true,
      },
      maskedVpa: {
        type: String,
      },
    },
    netbanking: {
      bankCode: {
        type: String,
      },
      bankName: {
        type: String,
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    nickname: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper static method to generate secure card fingerprint
paymentMethodSchema.statics.generateCardFingerprint = function (cardNumber) {
  const sanitized = String(cardNumber).replace(/\s+/g, "");
  return crypto
    .createHash("sha256")
    .update(sanitized + (process.env.ACCESS_TOKEN_SECRET || "salt_default"))
    .digest("hex");
};

// Helper static method to detect card brand
paymentMethodSchema.statics.detectCardBrand = function (cardNumber) {
  const clean = String(cardNumber).replace(/\D/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^(60|65|81|82|508)/.test(clean)) return "rupay";
  if (/^6(?:011|5)/.test(clean)) return "discover";
  return "other";
};

export const PaymentMethod = mongoose.model(
  "PaymentMethod",
  paymentMethodSchema
);
