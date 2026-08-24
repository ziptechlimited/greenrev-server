import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  deleteUser,
  listTransactions,
  listUsers,
  updateUserRole,
  updateUserStatus,
  updateUserTier,
  revokeUserSessions,
  requestUserSuspension,
  approveUserSuspension,
  listRoles,
  assignRole,
  listAuditLogs,
} from "../controllers/AdminDashboardController";

const router = Router();

router.use(requireAuth, requireRole(["admin"]));

router.get("/users", listUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/tier", updateUserTier);
router.post("/users/:id/revoke-sessions", revokeUserSessions);
router.post("/users/:id/suspend-request", requestUserSuspension);
router.post("/approval-requests/:requestId/resolve", approveUserSuspension);
router.delete("/users/:id", deleteUser);
router.get("/transactions", listTransactions);

router.get("/roles", listRoles);
router.post("/users/:id/assign-role", assignRole);

router.get("/audit-logs", listAuditLogs);

export default router;
