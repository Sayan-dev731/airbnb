import { body, param, query } from "express-validator";
import { PROPERTY_TYPES } from "../utils/constants.js";

export const createListingValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 5, max: 120 })
      .withMessage("Title must be between 5 and 120 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("propertyType")
      .trim()
      .notEmpty()
      .withMessage("Property type is required")
      .isIn(PROPERTY_TYPES)
      .withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(", ")}`),
    body("basePrice")
      .notEmpty()
      .withMessage("Base price is required")
      .isNumeric()
      .withMessage("Base price must be a number")
      .custom((value) => value >= 100)
      .withMessage("Base price must be at least ₹100"),
    body("discountPercentage")
      .optional()
      .isNumeric()
      .custom((val) => val >= 0 && val <= 90)
      .withMessage("Discount percentage must be between 0 and 90"),
    body("cleaningFee")
      .optional()
      .isNumeric()
      .custom((val) => val >= 0)
      .withMessage("Cleaning fee cannot be negative"),
    body("guests")
      .notEmpty()
      .withMessage("Guest capacity is required")
      .isInt({ min: 1 })
      .withMessage("Guests must be at least 1"),
    body("city")
      .trim()
      .notEmpty()
      .withMessage("City is required"),
    body("address")
      .trim()
      .notEmpty()
      .withMessage("Address is required"),
    body("state")
      .trim()
      .notEmpty()
      .withMessage("State is required"),
  ];
};

export const updateListingValidator = () => {
  return [
    param("listingId").isMongoId().withMessage("Invalid listing ID format"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 5, max: 120 })
      .withMessage("Title must be between 5 and 120 characters"),
    body("propertyType")
      .optional()
      .isIn(PROPERTY_TYPES)
      .withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(", ")}`),
    body("basePrice")
      .optional()
      .isNumeric()
      .custom((val) => val >= 100)
      .withMessage("Base price must be at least ₹100"),
    body("discountPercentage")
      .optional()
      .isNumeric()
      .custom((val) => val >= 0 && val <= 90)
      .withMessage("Discount percentage must be between 0 and 90"),
  ];
};

export const listingQueryValidator = () => {
  return [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("minPrice")
      .optional()
      .isNumeric()
      .withMessage("minPrice must be a number"),
    query("maxPrice")
      .optional()
      .isNumeric()
      .withMessage("maxPrice must be a number"),
    query("guests")
      .optional()
      .isInt({ min: 1 })
      .withMessage("guests must be a positive integer"),
  ];
};
