import { Router } from "express";
import {
  processPaymentAndBook,
  getSavedPaymentMethods,
  deleteSavedPaymentMethod,
  getPaymentReceipt,
  getPaymentHistory,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { paymentLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Apply JWT verification to all payment endpoints
router.use(verifyJWT);

// Process payment and book reservation (rate limited)
router.route("/process-and-book").post(paymentLimiter, processPaymentAndBook);

// Saved payment methods management
router.route("/saved-methods").get(getSavedPaymentMethods);
router.route("/saved-methods/:id").delete(deleteSavedPaymentMethod);

// Receipts and transaction history
router.route("/history").get(getPaymentHistory);
router.route("/:id/receipt").get(getPaymentReceipt);

export default router;
