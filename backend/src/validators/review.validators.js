import { body, param } from "express-validator";

export const createReviewValidator = () => {
  return [
    body("listingId")
      .notEmpty()
      .withMessage("Listing ID is required")
      .isMongoId()
      .withMessage("Invalid Listing ID"),
    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .trim()
      .notEmpty()
      .withMessage("Comment is required")
      .isLength({ min: 5, max: 2000 })
      .withMessage("Comment must be between 5 and 2000 characters"),
    body("cleanliness")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Cleanliness rating must be between 1 and 5"),
    body("accuracy")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Accuracy rating must be between 1 and 5"),
    body("checkIn")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Check-in rating must be between 1 and 5"),
    body("communication")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Communication rating must be between 1 and 5"),
    body("location")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Location rating must be between 1 and 5"),
    body("value")
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage("Value rating must be between 1 and 5"),
  ];
};

export const hostReplyValidator = () => {
  return [
    param("reviewId").isMongoId().withMessage("Invalid review ID"),
    body("comment")
      .trim()
      .notEmpty()
      .withMessage("Host response comment is required")
      .isLength({ min: 2, max: 1000 })
      .withMessage("Response must be between 2 and 1000 characters"),
  ];
};
