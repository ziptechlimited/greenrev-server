"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const cmsController_1 = require("../controllers/cmsController");
const router = (0, express_1.Router)();
// Public read
router.get("/cms/:key", cmsController_1.getContent);
// Admin manage
router.use(auth_1.requireAuth, (0, auth_1.requireRole)(["admin"]));
router.get("/admin/cms", cmsController_1.getAllContent);
router.put("/admin/cms/:key", cmsController_1.upsertContent);
router.delete("/admin/cms/:key", cmsController_1.deleteContent);
exports.default = router;
