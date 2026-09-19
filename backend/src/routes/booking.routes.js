import { Router } from "express";
import {
  checkPriceAndAvailability,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getHostReservations,
} from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createBookingValidator } from "../validators/booking.validators.js";
import { USER_ROLES } from "../utils/constants.js";

const router = Router();

// Public: Price calculation & instant availability check
router.route("/check-price").post(checkPriceAndAvailability);

// Protected routes (All authenticated users)
router.use(verifyJWT);

router.route("/").post(validate(createBookingValidator()), createBooking);
router.route("/my-trips").get(getMyBookings);
router.route("/:bookingId").get(getBookingById);
router.route("/:bookingId/cancel").patch(cancelBooking);

// Host / Admin reservations view
router
  .route("/host/reservations")
  .get(authorizeRoles(USER_ROLES.HOST, USER_ROLES.ADMIN), getHostReservations);

export default router;
