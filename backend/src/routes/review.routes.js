import { Router } from "express";
import {
  createReview,
  getListingReviews,
  hostReplyToReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createReviewValidator,
  hostReplyValidator,
} from "../validators/review.validators.js";
import { USER_ROLES } from "../utils/constants.js";

const router = Router();

// Public: View reviews for a listing
router.route("/listing/:listingId").get(getListingReviews);

// Protected
router.use(verifyJWT);

router.route("/").post(validate(createReviewValidator()), createReview);

router
  .route("/:reviewId/reply")
  .post(
    authorizeRoles(USER_ROLES.HOST, USER_ROLES.ADMIN),
    validate(hostReplyValidator()),
    hostReplyToReview
  );

router.route("/:reviewId").delete(deleteReview);

export default router;
