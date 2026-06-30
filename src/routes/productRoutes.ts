import { Router } from "express";
import {
  createProduct,
  getVendorProducts,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from "../controllers/productController";

import { requireAuth } from "../middleware/auth";
import { slidingWindowRateLimit } from "../middleware/rateLimit";

const router = Router();

const productLimiter = slidingWindowRateLimit({
  windowMs: 60_000,
  max: 20,
});

router.post("/products", productLimiter, requireAuth, createProduct);
router.get("/products", productLimiter, getAllProducts);
router.get("/products/vendor", productLimiter, requireAuth, getVendorProducts);
router.delete("/products/bulk", productLimiter, requireAuth, bulkDeleteProducts);
router.get("/products/:id", productLimiter, getProduct);
router.put("/products/:id", productLimiter, requireAuth, updateProduct);
router.delete("/products/:id", productLimiter, requireAuth, deleteProduct);


export default router;
