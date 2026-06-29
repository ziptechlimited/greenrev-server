"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const acquisitionController_1 = require("../controllers/acquisitionController");
const reviewController_1 = require("../controllers/reviewController");
const messageController_1 = require("../controllers/messageController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
const limiter = (0, rateLimit_1.slidingWindowRateLimit)({ windowMs: 60_000, max: 30 });
// Acquisition Requests
router.post("/acquisition-requests", limiter, auth_1.requireAuth, acquisitionController_1.createRequest);
router.get("/acquisition-requests", limiter, auth_1.requireAuth, acquisitionController_1.getCustomerRequests);
router.get("/acquisition-requests/vendor", limiter, auth_1.requireAuth, acquisitionController_1.getVendorRequests);
router.get("/acquisition-requests/vendor/count", limiter, auth_1.requireAuth, acquisitionController_1.getVendorRequestCount);
router.patch("/acquisition-requests/:id/vendor/accept", limiter, auth_1.requireAuth, acquisitionController_1.vendorAccept);
router.post("/acquisition-requests/:id/receipt", limiter, auth_1.requireAuth, acquisitionController_1.uploadReceipt);
router.post("/acquisition-requests/:id/vendor/confirm-payment", limiter, auth_1.requireAuth, acquisitionController_1.vendorConfirmPayment);
router.post("/acquisition-requests/:id/client/confirm-completed", limiter, auth_1.requireAuth, acquisitionController_1.customerConfirmCompleted);
// Messages
router.get("/acquisition-requests/:id/messages", limiter, auth_1.requireAuth, messageController_1.getMessages);
router.post("/acquisition-requests/:id/messages", limiter, auth_1.requireAuth, messageController_1.sendMessage);
// Reviews
router.post("/acquisition-requests/:id/review", limiter, auth_1.requireAuth, reviewController_1.createReview);
router.get("/reviews/vendor/:vendorId", limiter, reviewController_1.getVendorReviews);
exports.default = router;
