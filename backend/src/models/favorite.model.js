import mongoose, { Schema } from "mongoose";

const favoriteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    collectionName: {
      type: String,
      default: "My Wishlist",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only favorite a listing once in a specific collection
favoriteSchema.index({ user: 1, listing: 1, collectionName: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);
