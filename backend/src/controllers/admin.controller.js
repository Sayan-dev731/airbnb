import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Booking } from "../models/booking.model.js";
import { Review } from "../models/review.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES, BOOKING_STATUS } from "../utils/constants.js";

/**
 * @desc    Get aggregate platform metrics for Admin dashboard
 * @route   GET /api/v1/admin/dashboard-stats
 * @access  Protected (Admin only)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalHosts,
    totalListings,
    totalBookings,
    totalReviews,
    revenueStats,
    recentBookings,
    topCities,
  ] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.USER }),
    User.countDocuments({ role: USER_ROLES.HOST }),
    Listing.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
    Booking.aggregate([
      { $match: { bookingStatus: BOOKING_STATUS.CONFIRMED } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricingBreakdown.grandTotal" },
          totalServiceFees: { $sum: "$pricingBreakdown.serviceFee" },
        },
      },
    ]),
    Booking.find()
      .populate("user", "name email avatar")
      .populate("listing", "title coverPhoto location")
      .sort({ createdAt: -1 })
      .limit(5),
    Listing.aggregate([
      { $group: { _id: "$location.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const totalRevenue = revenueStats[0]?.totalRevenue || 0;
  const platformEarnings = revenueStats[0]?.totalServiceFees || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overview: {
          totalUsers,
          totalHosts,
          totalListings,
          totalBookings,
          totalReviews,
          totalGrossVolume: totalRevenue,
          platformNetEarnings: platformEarnings,
        },
        recentBookings,
        topDestinations: topCities.map((c) => ({
          city: c._id,
          listingsCount: c.count,
        })),
      },
      "Admin dashboard stats retrieved successfully"
    )
  );
});

/**
 * @desc    Get all users (Admin management)
 * @route   GET /api/v1/admin/users
 * @access  Protected (Admin only)
 */
export const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      "Users retrieved successfully"
    )
  );
});

/**
 * @desc    Update user role / status (Admin only)
 * @route   PATCH /api/v1/admin/users/:userId/role
 * @access  Protected (Admin only)
 */
export const updateUserRoleAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role, isSuperHost, isHostVerified } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (role) user.role = role;
  if (isSuperHost !== undefined) user.isSuperHost = isSuperHost;
  if (isHostVerified !== undefined) user.isHostVerified = isHostVerified;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully by admin"));
});

/**
 * @desc    Toggle listing publish / moderation status
 * @route   PATCH /api/v1/admin/listings/:listingId/toggle-publish
 * @access  Protected (Admin only)
 */
export const toggleListingPublishAdmin = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  listing.isPublished = !listing.isPublished;
  await listing.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: listing.isPublished },
        `Listing ${listing.isPublished ? "published" : "un-published"} successfully`
      )
    );
});

/**
 * @desc    Toggle featured status for homepage
 * @route   PATCH /api/v1/admin/listings/:listingId/toggle-feature
 * @access  Protected (Admin only)
 */
export const toggleListingFeatureAdmin = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  listing.isFeatured = !listing.isFeatured;
  await listing.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isFeatured: listing.isFeatured },
        `Listing ${listing.isFeatured ? "featured" : "un-featured"} successfully`
      )
    );
});

/**
 * @desc    Get all platform bookings (Admin only)
 * @route   GET /api/v1/admin/bookings
 * @access  Protected (Admin only)
 */
export const getAllBookingsAdmin = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate("listing", "title coverPhoto location propertyType pricing")
    .populate("user", "name email phone avatar")
    .populate("host", "name email phone avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, bookings, "All platform bookings retrieved successfully")
    );
});
