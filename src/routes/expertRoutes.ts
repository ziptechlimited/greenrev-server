import { Router } from "express";
import { getExperts, getExpertReviews, createExpertReview } from "../controllers/expertController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/experts", getExperts);
router.get("/experts/:id/reviews", getExpertReviews);
router.post("/experts/:id/reviews", requireAuth, createExpertReview);

export default router;
