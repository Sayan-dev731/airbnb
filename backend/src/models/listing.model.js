import mongoose, { Schema } from "mongoose";
import { PROPERTY_TYPES, CATEGORIES } from "../utils/constants.js";

const photoSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    roomType: {
      type: String,
      enum: [
        "Living room",
        "Bedroom",
        "Full kitchen",
        "Bathroom",
        "Balcony",
        "Exterior",
        "Pool",
        "Dining area",
        "Workspace",
        "General",
      ],
      default: "General",
    },
    isCover: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const listingSchema = new Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Host is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Listing title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Listing description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: [true, "Property type is required"],
      index: true,
    },
    categories: [
      {
        type: String,
        enum: CATEGORIES,
      },
    ],
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
      zipCode: { type: String },
      neighborhood: { type: String },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: [true, "Base price per night is required"],
        min: [100, "Price must be at least ₹100"],
      },
      currency: {
        type: String,
        default: "INR",
      },
      discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 90,
      },
      cleaningFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      serviceFeePercent: {
        type: Number,
        default: 12,
        min: 0,
        max: 30,
      },
      weeklyDiscountPercent: {
        type: Number,
        default: 0,
      },
      monthlyDiscountPercent: {
        type: Number,
        default: 0,
      },
    },
    capacity: {
      guests: {
        type: Number,
        required: [true, "Max guest count is required"],
        min: 1,
        default: 2,
      },
      bedrooms: {
        type: Number,
        default: 1,
        min: 1,
      },
      beds: {
        type: Number,
        default: 1,
        min: 1,
      },
      bathrooms: {
        type: Number,
        default: 1,
        min: 0.5,
      },
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    photos: [photoSchema],
    coverPhoto: {
      type: String,
      default:
        "https://res.cloudinary.com/dhrwd9cxy/image/upload/v1710000000/airbnb/listings/default_listing.jpg",
    },
    houseRules: {
      checkInTime: { type: String, default: "14:00" },
      checkOutTime: { type: String, default: "11:00" },
      selfCheckIn: { type: Boolean, default: true },
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      partiesAllowed: { type: Boolean, default: false },
      quietHours: { type: String, default: "22:00 - 08:00" },
    },
    ratingsSummary: {
      averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
      cleanliness: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      checkIn: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0, index: true },
    },
    isGuestFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    blackoutDates: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for discounted per-night price
listingSchema.virtual("discountedPrice").get(function () {
  if (!this.pricing || !this.pricing.basePrice) return 0;
  if (!this.pricing.discountPercentage) return this.pricing.basePrice;
  const discount = (this.pricing.basePrice * this.pricing.discountPercentage) / 100;
  return Math.round(this.pricing.basePrice - discount);
});

// Text indexing for fast search by title, description, city, neighborhood
listingSchema.index({
  title: "text",
  description: "text",
  "location.city": "text",
  "location.neighborhood": "text",
  "location.state": "text",
});

export const Listing = mongoose.model("Listing", listingSchema);
