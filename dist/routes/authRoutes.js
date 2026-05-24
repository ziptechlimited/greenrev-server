"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
const authLimiter = (0, rateLimit_1.slidingWindowRateLimit)({
    windowMs: 60_000,
    max: 20,
});
const sensitiveLimiter = (0, rateLimit_1.slidingWindowRateLimit)({
    windowMs: 60_000,
    max: 8,
});
router.post("/register", sensitiveLimiter, authController_1.register);
router.post("/login", sensitiveLimiter, authController_1.login);
router.post("/logout", authLimiter, authController_1.logout);
router.post("/refresh", authLimiter, authController_1.refresh);
router.get("/me", authLimiter, auth_1.requireAuth, authController_1.me);
router.post("/email/verify", authLimiter, authController_1.verifyEmail);
router.post("/email/resend", authLimiter, authController_1.resendVerification);
router.post("/password/forgot", authLimiter, authController_1.forgotPassword);
router.post("/password/reset", authLimiter, authController_1.resetPassword);
router.get("/google", authLimiter, authController_1.googleStart);
router.get("/google/callback", authLimiter, authController_1.googleCallback);
exports.default = router;
