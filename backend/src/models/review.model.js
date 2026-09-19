import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer user is required"],
      index: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing is required"],
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    rating: {
      type: Number,
      required: [true, "Overall rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    detailedRatings: {
      cleanliness: { type: Number, min: 1, max: 5, default: 5 },
      accuracy: { type: Number, min: 1, max: 5, default: 5 },
      checkIn: { type: Number, min: 1, max: 5, default: 5 },
      communication: { type: Number, min: 1, max: 5, default: 5 },
      location: { type: Number, min: 1, max: 5, default: 5 },
      value: { type: Number, min: 1, max: 5, default: 5 },
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    hostResponse: {
      comment: { type: String, maxlength: 1000 },
      respondedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per user for same booking/listing
reviewSchema.index({ listing: 1, user: 1 }, { unique: false });

// Static method to recalculate and update listing ratings
reviewSchema.statics.calculateAverageRating = async function (listingId) {
  const stats = await this.aggregate([
    {
      $match: { listing: new mongoose.Types.ObjectId(listingId) },
    },
    {
      $group: {
        _id: "$listing",
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        cleanliness: { $avg: "$detailedRatings.cleanliness" },
        accuracy: { $avg: "$detailedRatings.accuracy" },
        checkIn: { $avg: "$detailedRatings.checkIn" },
        communication: { $avg: "$detailedRatings.communication" },
        location: { $avg: "$detailedRatings.location" },
        value: { $avg: "$detailedRatings.value" },
      },
    },
  ]);

  const Listing = mongoose.model("Listing");

  if (stats.length > 0) {
    const s = stats[0];
    const avg = Math.round(s.averageRating * 100) / 100;
    await Listing.findByIdAndUpdate(listingId, {
      ratingsSummary: {
        averageRating: avg,
        cleanliness: Math.round(s.cleanliness * 10) / 10,
        accuracy: Math.round(s.accuracy * 10) / 10,
        checkIn: Math.round(s.checkIn * 10) / 10,
        communication: Math.round(s.communication * 10) / 10,
        location: Math.round(s.location * 10) / 10,
        value: Math.round(s.value * 10) / 10,
        totalReviews: s.totalReviews,
      },
      isGuestFavorite: avg >= 4.8 && s.totalReviews >= 2,
    });
  } else {
    await Listing.findByIdAndUpdate(listingId, {
      ratingsSummary: {
        averageRating: 0,
        cleanliness: 0,
        accuracy: 0,
        checkIn: 0,
        communication: 0,
        location: 0,
        value: 0,
        totalReviews: 0,
      },
      isGuestFavorite: false,
    });
  }
};

// Post hooks to trigger recalculation on save and delete
reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.listing);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.listing);
  }
});

export const Review = mongoose.model("Review", reviewSchema);
