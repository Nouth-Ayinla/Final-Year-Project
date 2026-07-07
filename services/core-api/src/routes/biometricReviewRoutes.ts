import express from "express";
import { GetBiometricReviews, UpdateBiometricStatus } from "../controllers/biometricReviewControllers.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/review-queue", protectRoute, GetBiometricReviews);
router.post("/update/:id", protectRoute, UpdateBiometricStatus);

export default router;
