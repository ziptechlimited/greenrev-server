"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
router.get("/admin/ping", auth_1.requireAuth, (0, auth_1.requireRole)(["admin"]), (_req, res) => {
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true, role: "admin" });
});
router.get("/vendor/ping", auth_1.requireAuth, (0, auth_1.requireRole)(["vendor", "admin"]), (_req, res) => {
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true, role: "vendor" });
});
router.get("/mechanic/ping", auth_1.requireAuth, (0, auth_1.requireRole)(["mechanic", "admin"]), (_req, res) => {
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true, role: "mechanic" });
});
router.get("/customer/ping", auth_1.requireAuth, (0, auth_1.requireRole)(["customer", "admin"]), (_req, res) => {
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true, role: "customer" });
});
exports.default = router;
