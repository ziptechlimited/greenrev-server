import { Router } from "express";
import {
  forgotPassword,
  googleCallback,
  googleStart,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { slidingWindowRateLimit } from "../middleware/rateLimit";

const router = Router();

const authLimiter = slidingWindowRateLimit({
  windowMs: 60_000,
  max: 20,
});

const sensitiveLimiter = slidingWindowRateLimit({
  windowMs: 60_000,
  max: 8,
});

router.post("/register", sensitiveLimiter, register);
router.post("/login", sensitiveLimiter, login);
router.post("/logout", authLimiter, logout);
router.post("/refresh", authLimiter, refresh);
router.get("/me", authLimiter, requireAuth, me);

router.post("/email/verify", authLimiter, verifyEmail);
router.post("/email/resend", authLimiter, resendVerification);

router.post("/password/forgot", authLimiter, forgotPassword);
router.post("/password/reset", authLimiter, resetPassword);

router.get("/google", authLimiter, googleStart);
router.get("/google/callback", authLimiter, googleCallback);

export default router;

