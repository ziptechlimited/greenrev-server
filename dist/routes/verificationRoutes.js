"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationRoutes = void 0;
const express_1 = require("express");
const VerificationController_1 = require("../controllers/VerificationController");
const auth_1 = require("../middleware/auth");
const SmileWebhookController_1 = require("../controllers/SmileWebhookController");
const router = (0, express_1.Router)();
// ── Public webhook — called by Smile ID servers, NOT end users ──────────────
router.post("/webhook", SmileWebhookController_1.smileWebhookHandler);
// All other verification routes require authentication
router.use(auth_1.requireAuth);
router.post("/individual", VerificationController_1.VerificationController.submitIndividual);
router.post("/business", VerificationController_1.VerificationController.submitBusiness);
router.get("/status", VerificationController_1.VerificationController.getStatus);
exports.verificationRoutes = router;
