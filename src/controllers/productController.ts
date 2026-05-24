import type { Response } from "express";
import { Product } from "../models/Product";
import { User } from "../models/User";
import type { CustomReq } from "../types/auth";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function createProduct(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    if (req.user.role !== "vendor" && req.user.role !== "admin") {
      return sendError(res, 403, {
        code: "FORBIDDEN",
        message: "Only vendors can create products",
      });
    }

    const {
      name,
      make,
      category,
      price,
      priceValue,
      year,
      mileage,
      color,
      image,
      images,
      specs,
      description,
      inStock,
      stockQuantity,
    } = req.body;

    if (!name || !make || !category || !price || !image) {
      return sendError(res, 400, {
        code: "VALIDATION_ERROR",
        message: "Name, make, category, price, and image are required",
      });
    }

    const vendor = await User.findById(req.user.id).select("name companyName");
    if (!vendor) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Vendor not found",
      });
    }

    const product = new Product({
      name,
      make,
      category,
      price,
      priceValue,
      year,
      mileage,
      color,
      image,
      images: images || [],
      specs: specs || {},
      description,
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity: stockQuantity || 1,
      vendorId: req.user.id,
      vendorName: vendor.name || vendor.companyName || "Unknown Vendor",
    });

    await product.save();

    return sendSuccess(res, 201, product);
  } catch (error) {
    console.error("Error creating product:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to create product",
    });
  }
}

export async function getVendorProducts(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const products = await Product.find({ vendorId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, { products });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch products",
    });
  }
}

export async function getAllProducts(req: CustomReq, res: Response) {
  try {
    const { category } = req.query;

    const query: any = {};
    if (category && (category === "vehicle" || category === "part")) {
      query.category = category;
    }

    const products = await Product.find({ ...query })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, { products });
  } catch (error) {
    console.error("Error fetching all products:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch products",
    });
  }
}

export async function getProduct(req: CustomReq, res: Response) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }

    return sendSuccess(res, 200, product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch product",
    });
  }
}

export async function updateProduct(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }

    if (
      product.vendorId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return sendError(res, 403, {
        code: "FORBIDDEN",
        message: "You can only update your own products",
      });
    }

    const allowedUpdates = [
      "name",
      "make",
      "category",
      "price",
      "priceValue",
      "year",
      "mileage",
      "color",
      "image",
      "images",
      "specs",
      "description",
      "inStock",
      "stockQuantity",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (product as any)[field] = req.body[field];
      }
    });

    await product.save();

    return sendSuccess(res, 200, product);
  } catch (error) {
    console.error("Error updating product:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to update product",
    });
  }
}

export async function deleteProduct(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }

    if (
      product.vendorId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return sendError(res, 403, {
        code: "FORBIDDEN",
        message: "You can only delete your own products",
      });
    }

    await Product.findByIdAndDelete(id);

    return sendSuccess(res, 200, { message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to delete product",
    });
  }
}
