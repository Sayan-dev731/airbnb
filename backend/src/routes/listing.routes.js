import { Router } from "express";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  uploadListingPhotos,
  deleteListingPhoto,
  getHostListings,
  getGuestFavorites,
} from "../controllers/listing.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createListingValidator,
  updateListingValidator,
  listingQueryValidator,
} from "../validators/listing.validators.js";
import { USER_ROLES } from "../utils/constants.js";

const router = Router();

// Public routes
router.route("/").get(validate(listingQueryValidator()), getListings);
router.route("/guest-favorites").get(getGuestFavorites);
router.route("/:listingId").get(getListingById);

// Protected routes (Host & Admin only)
router.use(verifyJWT);

router
  .route("/host/my-listings")
  .get(authorizeRoles(USER_ROLES.HOST, USER_ROLES.ADMIN), getHostListings);

router.route("/").post(
  authorizeRoles(USER_ROLES.HOST, USER_ROLES.ADMIN),
  upload.array("photos", 25),
  validate(createListingValidator()),
  createListing
);

router.route("/:listingId").patch(
  authorizeRoles(USER_ROLES.HOST, USER_ROLES.ADMIN),
  validate(updateListingValidator()),
  updateListing
);

router
  .route("/:listingId")
  .delete(authorizeRoles(USER_ROLES.HOST, USER_ROLES.ADMIN), deleteListing);

router.route("/:listingId/photos").post(
  authorizeRoles(USER_ROLES.HOST, USER_ROLES.ADMIN),
  upload.array("photos", 25),
  uploadListingPhotos
);

router
  .route("/:listingId/photos/:photoId")
  .delete(
    authorizeRoles(USER_ROLES.HOST, USER_ROLES.ADMIN),
    deleteListingPhoto
  );

export default router;
