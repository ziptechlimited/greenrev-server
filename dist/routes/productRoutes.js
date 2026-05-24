"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
const productLimiter = (0, rateLimit_1.slidingWindowRateLimit)({
    windowMs: 60_000,
    max: 20,
});
router.post("/products", productLimiter, auth_1.requireAuth, productController_1.createProduct);
router.get("/products", productLimiter, productController_1.getAllProducts);
router.get("/products/vendor", productLimiter, auth_1.requireAuth, productController_1.getVendorProducts);
router.get("/products/:id", productLimiter, productController_1.getProduct);
router.put("/products/:id", productLimiter, auth_1.requireAuth, productController_1.updateProduct);
router.delete("/products/:id", productLimiter, auth_1.requireAuth, productController_1.deleteProduct);
exports.default = router;
