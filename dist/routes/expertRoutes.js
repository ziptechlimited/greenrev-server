"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expertController_1 = require("../controllers/expertController");
const router = (0, express_1.Router)();
router.get("/experts", expertController_1.getExperts);
exports.default = router;
