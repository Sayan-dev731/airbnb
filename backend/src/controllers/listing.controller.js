import mongoose from "mongoose";
import { Listing } from "../models/listing.model.js";
import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES } from "../utils/constants.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

/**
 * @desc    Get all listings with filters, search, and pagination
 * @route   GET /api/v1/listings
 * @access  Public
 */
export const getListings = asyncHandler(async (req, res) => {
  const {
    search,
    city,
    category,
    propertyType,
    minPrice,
    maxPrice,
    guests,
    bedrooms,
    bathrooms,
    amenities,
    isGuestFavorite,
    checkInDate,
    checkOutDate,
    sortBy = "newest",
    page = 1,
    limit = 20,
  } = req.query;

  const query = { isPublished: true };

  // Text search query
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "location.city": { $regex: search, $options: "i" } },
      { "location.neighborhood": { $regex: search, $options: "i" } },
      { "location.state": { $regex: search, $options: "i" } },
    ];
  }

  // City filter
  if (city) {
    query["location.city"] = { $regex: new RegExp(`^${city}$`, "i") };
  }

  // Category filter
  if (category) {
    query.categories = { $in: [category] };
  }

  // Property Type filter
  if (propertyType) {
    query.propertyType = propertyType;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query["pricing.basePrice"] = {};
    if (minPrice) query["pricing.basePrice"].$gte = Number(minPrice);
    if (maxPrice) query["pricing.basePrice"].$lte = Number(maxPrice);
  }

  // Capacity filters
  if (guests) {
    query["capacity.guests"] = { $gte: Number(guests) };
  }
  if (bedrooms) {
    query["capacity.bedrooms"] = { $gte: Number(bedrooms) };
  }
  if (bathrooms) {
    query["capacity.bathrooms"] = { $gte: Number(bathrooms) };
  }

  // Amenities filter
  if (amenities) {
    const amenitiesList = Array.isArray(amenities)
      ? amenities
      : amenities.split(",").map((a) => a.trim());
    query.amenities = { $all: amenitiesList };
  }

  // Guest favorite filter
  if (isGuestFavorite === "true" || isGuestFavorite === true) {
    query.isGuestFavorite = true;
  }

  // Date availability collision filter
  if (checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Find booked listings in the date range
    const bookedListingIds = await Booking.find({
      bookingStatus: { $in: ["confirmed", "pending"] },
      $or: [
        {
          checkInDate: { $lte: checkIn },
          checkOutDate: { $gt: checkIn },
        },
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gte: checkOut },
        },
        {
          checkInDate: { $gte: checkIn },
          checkOutDate: { $lte: checkOut },
        },
      ],
    }).distinct("listing");

    if (bookedListingIds.length > 0) {
      query._id = { $nin: bookedListingIds };
    }
  }

  // Sorting
  let sortOption = {};
  switch (sortBy) {
    case "price_asc":
      sortOption = { "pricing.basePrice": 1 };
      break;
    case "price_desc":
      sortOption = { "pricing.basePrice": -1 };
      break;
    case "rating":
      sortOption = { "ratingsSummary.averageRating": -1 };
      break;
    case "reviews":
      sortOption = { "ratingsSummary.totalReviews": -1 };
      break;
    case "newest":
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [listings, totalCount] = await Promise.all([
    Listing.find(query)
      .populate("host", "name avatar isSuperHost hostingSince")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true }),
    Listing.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        listings,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
          hasNextPage: pageNum * limitNum < totalCount,
          hasPrevPage: pageNum > 1,
        },
      },
      "Listings fetched successfully"
    )
  );
});

/**
 * @desc    Get listing details by ID
 * @route   GET /api/v1/listings/:listingId
 * @access  Public
 */
export const getListingById = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new ApiError(400, "Invalid listing ID format");
  }

  const listing = await Listing.findById(listingId)
    .populate("host", "name email avatar bio isSuperHost isHostVerified hostingSince")
    .lean({ virtuals: true });

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, listing, "Listing details retrieved successfully"));
});

/**
 * @desc    Create a new listing / hotel (Host / Admin)
 * @route   POST /api/v1/listings
 * @access  Protected (Host / Admin)
 */
export const createListing = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    propertyType,
    categories,
    address,
    city,
    state,
    country,
    zipCode,
    neighborhood,
    lat,
    lng,
    basePrice,
    discountPercentage,
    cleaningFee,
    serviceFeePercent,
    guests,
    bedrooms,
    beds,
    bathrooms,
    amenities,
    houseRules,
    photos: bodyPhotos,
  } = req.body;

  // Process uploaded image files if any
  const photoObjects = [];

  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const uploadResult = await uploadOnCloudinary(
        file.path,
        "airbnb/listings"
      );
      if (uploadResult) {
        photoObjects.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: req.body[`photoCaption_${i}`] || `Photo ${i + 1}`,
          roomType: req.body[`photoRoomType_${i}`] || (i === 0 ? "Exterior" : "Living room"),
          isCover: i === 0,
          order: i,
        });
      }
    }
  }

  // If photos provided as JSON array of objects or strings
  if (bodyPhotos) {
    let parsedBodyPhotos = [];
    if (typeof bodyPhotos === "string") {
      try {
        parsedBodyPhotos = JSON.parse(bodyPhotos);
      } catch (e) {
        parsedBodyPhotos = [bodyPhotos];
      }
    } else if (Array.isArray(bodyPhotos)) {
      parsedBodyPhotos = bodyPhotos;
    }

    parsedBodyPhotos.forEach((item, index) => {
      if (typeof item === "string") {
        photoObjects.push({
          url: item,
          caption: `Photo ${photoObjects.length + 1}`,
          roomType: index === 0 ? "Exterior" : "Living room",
          isCover: photoObjects.length === 0,
          order: photoObjects.length,
        });
      } else if (typeof item === "object" && item.url) {
        photoObjects.push({
          url: item.url,
          publicId: item.publicId || "",
          caption: item.caption || `Photo ${photoObjects.length + 1}`,
          roomType: item.roomType || "General",
          isCover: item.isCover || photoObjects.length === 0,
          order: item.order !== undefined ? item.order : photoObjects.length,
        });
      }
    });
  }

  // Parse amenities and categories
  let parsedAmenities = [];
  if (amenities) {
    parsedAmenities = Array.isArray(amenities)
      ? amenities
      : typeof amenities === "string"
        ? amenities.split(",").map((a) => a.trim())
        : [];
  }

  let parsedCategories = [];
  if (categories) {
    parsedCategories = Array.isArray(categories)
      ? categories
      : typeof categories === "string"
        ? categories.split(",").map((c) => c.trim())
        : [];
  }

  // Cover photo logic
  const coverPhotoUrl =
    photoObjects.find((p) => p.isCover)?.url ||
    photoObjects[0]?.url ||
    "https://res.cloudinary.com/dhrwd9cxy/image/upload/v1710000000/airbnb/listings/default_listing.jpg";

  const newListing = await Listing.create({
    host: req.user._id,
    title,
    description,
    propertyType,
    categories: parsedCategories,
    location: {
      address: address || req.body["location[address]"],
      city: city || req.body["location[city]"],
      state: state || req.body["location[state]"],
      country: country || req.body["location[country]"] || "India",
      zipCode: zipCode || req.body["location[zipCode]"],
      neighborhood: neighborhood || req.body["location[neighborhood]"],
      coordinates: {
        lat: Number(lat || req.body["location[coordinates][lat]"] || 0),
        lng: Number(lng || req.body["location[coordinates][lng]"] || 0),
      },
    },
    pricing: {
      basePrice: Number(basePrice),
      discountPercentage: Number(discountPercentage || 0),
      cleaningFee: Number(cleaningFee || 0),
      serviceFeePercent: Number(serviceFeePercent || 12),
    },
    capacity: {
      guests: Number(guests || 2),
      bedrooms: Number(bedrooms || 1),
      beds: Number(beds || 1),
      bathrooms: Number(bathrooms || 1),
    },
    amenities: parsedAmenities,
    photos: photoObjects,
    coverPhoto: coverPhotoUrl,
    houseRules: houseRules || {
      checkInTime: "14:00",
      checkOutTime: "11:00",
      selfCheckIn: true,
      petsAllowed: false,
      smokingAllowed: false,
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newListing, "Property listing created successfully")
    );
});

/**
 * @desc    Update listing details (Host / Admin)
 * @route   PATCH /api/v1/listings/:listingId
 * @access  Protected (Host / Admin)
 */
export const updateListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Authorization check: Only property host or system admin can update
  if (
    listing.host.toString() !== req.user._id.toString() &&
    req.user.role !== USER_ROLES.ADMIN
  ) {
    throw new ApiError(
      403,
      "Forbidden: You do not have permission to modify this listing"
    );
  }

  const allowedUpdates = [
    "title",
    "description",
    "propertyType",
    "categories",
    "location",
    "pricing",
    "capacity",
    "amenities",
    "houseRules",
    "isPublished",
    "isFeatured",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (typeof req.body[field] === "object" && !Array.isArray(req.body[field])) {
        listing[field] = { ...listing[field].toObject?.(), ...req.body[field] };
      } else {
        listing[field] = req.body[field];
      }
    }
  });

  // Flat field support for forms
  if (req.body.basePrice) listing.pricing.basePrice = Number(req.body.basePrice);
  if (req.body.discountPercentage !== undefined)
    listing.pricing.discountPercentage = Number(req.body.discountPercentage);
  if (req.body.cleaningFee !== undefined)
    listing.pricing.cleaningFee = Number(req.body.cleaningFee);

  await listing.save();

  return res
    .status(200)
    .json(new ApiResponse(200, listing, "Listing updated successfully"));
});

/**
 * @desc    Delete listing (Host / Admin)
 * @route   DELETE /api/v1/listings/:listingId
 * @access  Protected (Host / Admin)
 */
export const deleteListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (
    listing.host.toString() !== req.user._id.toString() &&
    req.user.role !== USER_ROLES.ADMIN
  ) {
    throw new ApiError(
      403,
      "Forbidden: You do not have permission to delete this listing"
    );
  }

  // Remove photos from Cloudinary asynchronously
  if (listing.photos && listing.photos.length > 0) {
    listing.photos.forEach((photo) => {
      if (photo.publicId) {
        deleteFromCloudinary(photo.publicId).catch((err) =>
          console.error("Cloudinary delete error:", err)
        );
      }
    });
  }

  await Listing.findByIdAndDelete(listingId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Listing deleted successfully"));
});

/**
 * @desc    Upload additional photos to a listing
 * @route   POST /api/v1/listings/:listingId/photos
 * @access  Protected (Host / Admin)
 */
export const uploadListingPhotos = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (
    listing.host.toString() !== req.user._id.toString() &&
    req.user.role !== USER_ROLES.ADMIN
  ) {
    throw new ApiError(403, "Unauthorized to edit this listing's photos");
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No photo files provided for upload");
  }

  const newPhotos = [];
  const startOrder = listing.photos.length;

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const uploadResult = await uploadOnCloudinary(
      file.path,
      "airbnb/listings"
    );
    if (uploadResult) {
      newPhotos.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        caption: req.body.caption || `Room photo ${startOrder + i + 1}`,
        roomType: req.body.roomType || "General",
        isCover: listing.photos.length === 0 && i === 0,
        order: startOrder + i,
      });
    }
  }

  listing.photos.push(...newPhotos);
  if (!listing.coverPhoto && newPhotos.length > 0) {
    listing.coverPhoto = newPhotos[0].url;
  }
  await listing.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { photos: listing.photos },
        "Photos uploaded successfully"
      )
    );
});

/**
 * @desc    Delete a specific photo from a listing
 * @route   DELETE /api/v1/listings/:listingId/photos/:photoId
 * @access  Protected (Host / Admin)
 */
export const deleteListingPhoto = asyncHandler(async (req, res) => {
  const { listingId, photoId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (
    listing.host.toString() !== req.user._id.toString() &&
    req.user.role !== USER_ROLES.ADMIN
  ) {
    throw new ApiError(403, "Unauthorized to delete photos for this listing");
  }

  const photo = listing.photos.id(photoId);
  if (!photo) {
    throw new ApiError(404, "Photo not found in this listing");
  }

  if (photo.publicId) {
    await deleteFromCloudinary(photo.publicId);
  }

  listing.photos.pull({ _id: photoId });

  // If deleted photo was cover, update cover photo
  if (photo.isCover || listing.coverPhoto === photo.url) {
    if (listing.photos.length > 0) {
      listing.photos[0].isCover = true;
      listing.coverPhoto = listing.photos[0].url;
    } else {
      listing.coverPhoto = "";
    }
  }

  await listing.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { photos: listing.photos },
        "Photo removed successfully"
      )
    );
});

/**
 * @desc    Get listings owned by the logged-in Host
 * @route   GET /api/v1/listings/host/my-listings
 * @access  Protected (Host / Admin)
 */
export const getHostListings = asyncHandler(async (req, res) => {
  const filter = req.user.role === USER_ROLES.ADMIN ? {} : { host: req.user._id };
  const listings = await Listing.find(filter).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, listings, "Host listings retrieved successfully")
    );
});

/**
 * @desc    Get Guest Favorites listings (Top rated)
 * @route   GET /api/v1/listings/guest-favorites
 * @access  Public
 */
export const getGuestFavorites = asyncHandler(async (req, res) => {
  const listings = await Listing.find({
    isPublished: true,
    isGuestFavorite: true,
  })
    .limit(10)
    .sort({ "ratingsSummary.averageRating": -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, listings, "Guest favorites retrieved successfully")
    );
});
