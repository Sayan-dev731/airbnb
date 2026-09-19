import { Router } from "express";
import {
  getDashboardStats,
  getAllUsersAdmin,
  updateUserRoleAdmin,
  toggleListingPublishAdmin,
  toggleListingFeatureAdmin,
  getAllBookingsAdmin,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../utils/constants.js";

const router = Router();

// Secure all admin routes to ADMIN role only
router.use(verifyJWT);
router.use(authorizeRoles(USER_ROLES.ADMIN));

router.route("/dashboard-stats").get(getDashboardStats);
router.route("/users").get(getAllUsersAdmin);
router.route("/users/:userId/role").patch(updateUserRoleAdmin);
router.route("/bookings").get(getAllBookingsAdmin);
router
  .route("/listings/:listingId/toggle-publish")
  .patch(toggleListingPublishAdmin);
router
  .route("/listings/:listingId/toggle-feature")
  .patch(toggleListingFeatureAdmin);

export default router;
