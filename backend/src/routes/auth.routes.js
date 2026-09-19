import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  updateAccountDetails,
  updateUserAvatar,
  changeCurrentPassword,
  forgotPasswordRequest,
  resetPassword,
  switchOrRequestHostRole,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  verifyEmailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} from "../validators/auth.validators.js";

const router = Router();

// Public routes
router.route("/register").post(
  upload.single("avatar"),
  validate(userRegisterValidator()),
  registerUser
);

router.route("/login").post(validate(userLoginValidator()), loginUser);
router.route("/verify-email").post(validate(verifyEmailValidator()), verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(validate(forgotPasswordValidator()), forgotPasswordRequest);
router
  .route("/reset-password")
  .post(validate(resetPasswordValidator()), resetPassword);

// Protected routes (Requires JWT)
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/change-password")
  .post(verifyJWT, validate(changePasswordValidator()), changeCurrentPassword);
router.route("/become-host").post(verifyJWT, switchOrRequestHostRole);

export default router;
