import { Router } from "express";
import {
  toggleFavorite,
  getMyFavorites,
} from "../controllers/favorite.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getMyFavorites);
router.route("/toggle/:listingId").post(toggleFavorite);

export default router;
