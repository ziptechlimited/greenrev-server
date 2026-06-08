import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  deleteUser,
  listTransactions,
  listUsers,
  updateUserRole,
  updateUserStatus,
  updateUserTier,
} from "../controllers/AdminDashboardController";

const router = Router();

router.use(requireAuth, requireRole(["admin"]));

router.get("/users", listUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/tier", updateUserTier);
router.delete("/users/:id", deleteUser);
router.get("/transactions", listTransactions);

export default router;
