import { Router } from "express";
import { VerificationController } from "../controllers/VerificationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All verification routes require authentication
router.use(requireAuth);

router.post("/individual", VerificationController.submitIndividual);
router.post("/business", VerificationController.submitBusiness);
router.get("/status", VerificationController.getStatus);

export const verificationRoutes = router;
