import { body } from "express-validator";
import { AVAILABLE_USER_ROLES } from "../utils/constants.js";

export const userRegisterValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 60 })
      .withMessage("Name must be between 2 and 60 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role")
      .optional()
      .isIn(AVAILABLE_USER_ROLES)
      .withMessage(`Role must be one of: ${AVAILABLE_USER_ROLES.join(", ")}`),
  ];
};

export const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

export const verifyEmailValidator = () => {
  return [
    body("token")
      .optional()
      .isString()
      .withMessage("Verification token must be a string"),
    body("otp")
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be exactly 6 digits"),
    body().custom((value, { req }) => {
      if (!req.body.token && !req.body.otp && !req.query.token) {
        throw new Error("Either a verification token or OTP must be provided");
      }
      return true;
    }),
  ];
};

export const forgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

export const resetPasswordValidator = () => {
  return [
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ];
};

export const changePasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ];
};
