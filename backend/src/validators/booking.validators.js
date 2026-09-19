import { body, param } from "express-validator";

export const createBookingValidator = () => {
  return [
    body("listingId")
      .notEmpty()
      .withMessage("Listing ID is required")
      .isMongoId()
      .withMessage("Invalid Listing ID format"),
    body("checkInDate")
      .notEmpty()
      .withMessage("Check-in date is required")
      .isISO8601()
      .withMessage("Check-in date must be a valid ISO8601 date")
      .custom((value) => {
        const checkIn = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkIn < today) {
          throw new Error("Check-in date cannot be in the past");
        }
        return true;
      }),
    body("checkOutDate")
      .notEmpty()
      .withMessage("Check-out date is required")
      .isISO8601()
      .withMessage("Check-out date must be a valid ISO8601 date")
      .custom((value, { req }) => {
        const checkIn = new Date(req.body.checkInDate);
        const checkOut = new Date(value);
        if (checkOut <= checkIn) {
          throw new Error("Check-out date must be after check-in date");
        }
        return true;
      }),
    body("adults")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Adults count must be at least 1"),
  ];
};

export const updateBookingStatusValidator = () => {
  return [
    param("bookingId").isMongoId().withMessage("Invalid booking ID format"),
    body("status")
      .notEmpty()
      .withMessage("Booking status is required")
      .isIn(["pending", "confirmed", "cancelled", "completed"])
      .withMessage("Invalid status value"),
  ];
};
