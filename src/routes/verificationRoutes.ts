import { Router } from "express";
import { VerificationController } from "../controllers/VerificationController";
import { requireAuth } from "../middleware/auth";
import { smileWebhookHandler } from "../controllers/SmileWebhookController";

const router = Router();

// ── Public webhook — called by Smile ID servers, NOT end users ──────────────
router.post("/webhook", smileWebhookHandler);

// All other verification routes require authentication
router.use(requireAuth);

router.post("/individual", VerificationController.submitIndividual);
router.post("/business", VerificationController.submitBusiness);
router.get("/status", VerificationController.getStatus);

export const verificationRoutes = router;
