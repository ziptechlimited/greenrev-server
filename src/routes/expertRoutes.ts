import { Router } from "express";
import { getExperts, getExpertReviews, createExpertReview, createExpertMessage } from "../controllers/expertController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/experts", getExperts);
router.get("/experts/:id/reviews", getExpertReviews);
router.post("/experts/:id/reviews", requireAuth, createExpertReview);
router.post("/experts/:id/messages", requireAuth, createExpertMessage);

export default router;
