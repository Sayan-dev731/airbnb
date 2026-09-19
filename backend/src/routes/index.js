import { Router } from "express";
import authRoutes from "./auth.routes.js";
import listingRoutes from "./listing.routes.js";
import bookingRoutes from "./booking.routes.js";
import reviewRoutes from "./review.routes.js";
import favoriteRoutes from "./favorite.routes.js";
import adminRoutes from "./admin.routes.js";
import paymentRoutes from "./payment.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/listings", listingRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/admin", adminRoutes);

export default router;
