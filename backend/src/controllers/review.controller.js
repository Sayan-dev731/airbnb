import mongoose from "mongoose";
import { Review } from "../models/review.model.js";
import { Listing } from "../models/listing.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES } from "../utils/constants.js";

/**
 * @desc    Create a new review for a listing
 * @route   POST /api/v1/reviews
 * @access  Protected
 */
export const createReview = asyncHandler(async (req, res) => {
  const {
    listingId,
    bookingId,
    rating,
    detailedRatings,
    comment,
    cleanliness,
    accuracy,
    checkIn,
    communication,
    location,
    value,
  } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Prevent host from reviewing their own listing
  if (listing.host.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot review your own listing");
  }

  const reviewDetailedRatings = detailedRatings || {
    cleanliness: Number(cleanliness || rating),
    accuracy: Number(accuracy || rating),
    checkIn: Number(checkIn || rating),
    communication: Number(communication || rating),
    location: Number(location || rating),
    value: Number(value || rating),
  };

  const review = await Review.create({
    user: req.user._id,
    listing: listingId,
    booking: bookingId || undefined,
    rating: Number(rating),
    detailedRatings: reviewDetailedRatings,
    comment,
  });

  const populatedReview = await Review.findById(review._id).populate(
    "user",
    "name avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedReview, "Review created successfully"));
});

/**
 * @desc    Get all reviews for a listing
 * @route   GET /api/v1/reviews/listing/:listingId
 * @access  Public
 */
export const getListingReviews = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [reviews, totalCount] = await Promise.all([
    Review.find({ listing: listingId })
      .populate("user", "name avatar hostingSince")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments({ listing: listingId }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      },
      "Listing reviews retrieved successfully"
    )
  );
});

/**
 * @desc    Host reply to a review
 * @route   POST /api/v1/reviews/:reviewId/reply
 * @access  Protected (Host / Admin)
 */
export const hostReplyToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { comment } = req.body;

  const review = await Review.findById(reviewId).populate("listing");
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Authorization: Only property host or admin can reply
  if (
    review.listing.host.toString() !== req.user._id.toString() &&
    req.user.role !== USER_ROLES.ADMIN
  ) {
    throw new ApiError(403, "Forbidden: Only the property host can reply to this review");
  }

  review.hostResponse = {
    comment,
    respondedAt: new Date(),
  };
  await review.save();

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Response submitted successfully"));
});

/**
 * @desc    Delete a review (Author or Admin)
 * @route   DELETE /api/v1/reviews/:reviewId
 * @access  Protected
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== USER_ROLES.ADMIN
  ) {
    throw new ApiError(403, "Forbidden: You cannot delete this review");
  }

  await Review.findByIdAndDelete(reviewId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});
