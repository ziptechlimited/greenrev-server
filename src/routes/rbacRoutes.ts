import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { sendSuccess } from "../utils/apiResponse";

const router = Router();

router.get("/admin/ping", requireAuth, requireRole(["admin"]), (_req, res) => {
  return sendSuccess(res, 200, { ok: true, role: "admin" });
});

router.get(
  "/vendor/ping",
  requireAuth,
  requireRole(["vendor", "admin"]),
  (_req, res) => {
    return sendSuccess(res, 200, { ok: true, role: "vendor" });
  },
);

router.get(
  "/mechanic/ping",
  requireAuth,
  requireRole(["mechanic", "admin"]),
  (_req, res) => {
    return sendSuccess(res, 200, { ok: true, role: "mechanic" });
  },
);

router.get(
  "/customer/ping",
  requireAuth,
  requireRole(["customer", "admin"]),
  (_req, res) => {
    return sendSuccess(res, 200, { ok: true, role: "customer" });
  },
);

export default router;

