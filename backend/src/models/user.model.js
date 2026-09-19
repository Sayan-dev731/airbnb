import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { USER_ROLES, AVAILABLE_USER_ROLES } from "../utils/constants.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: AVAILABLE_USER_ROLES,
      default: USER_ROLES.USER,
      index: true,
    },
    avatar: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dhrwd9cxy/image/upload/v1710000000/airbnb/avatars/default_avatar.png",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationOTP: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    isHostVerified: {
      type: Boolean,
      default: false,
    },
    hostingSince: {
      type: Date,
    },
    isSuperHost: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing pre-save hook
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d",
    }
  );
};

// Generate Email Verification Token and 6-digit OTP
userSchema.methods.generateEmailVerificationData = function () {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  // Generate 6 digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerificationToken = hashedToken;
  this.emailVerificationOTP = otp;
  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return { unHashedToken, otp };
};

// Generate Password Reset Token
userSchema.methods.generatePasswordResetData = function () {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  this.passwordResetToken = hashedToken;
  this.passwordResetExpiry = Date.now() + 15 * 60 * 1000; // 15 mins

  return unHashedToken;
};

export const User = mongoose.model("User", userSchema);
