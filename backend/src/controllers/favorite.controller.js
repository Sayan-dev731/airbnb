import { Favorite } from "../models/favorite.model.js";
import { Listing } from "../models/listing.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Toggle a listing in user's favorites / wishlist
 * @route   POST /api/v1/favorites/toggle/:listingId
 * @access  Protected
 */
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const collectionName = req.body?.collectionName || "My Wishlist";

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  const existingFavorite = await Favorite.findOne({
    user: req.user._id,
    listing: listingId,
  });

  if (existingFavorite) {
    await Favorite.findByIdAndDelete(existingFavorite._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isFavorited: false },
          "Listing removed from wishlist"
        )
      );
  } else {
    const favorite = await Favorite.create({
      user: req.user._id,
      listing: listingId,
      collectionName,
    });
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { isFavorited: true, favorite },
          "Listing saved to wishlist"
        )
      );
  }
});

/**
 * @desc    Get user's wishlisted listings
 * @route   GET /api/v1/favorites
 * @access  Protected
 */
export const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate({
      path: "listing",
      select:
        "title coverPhoto location pricing ratingsSummary propertyType isGuestFavorite",
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, favorites, "Wishlist retrieved successfully")
    );
});
