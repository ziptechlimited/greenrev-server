"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.getVendorProducts = getVendorProducts;
exports.getAllProducts = getAllProducts;
exports.getProduct = getProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const apiResponse_1 = require("../utils/apiResponse");
async function createProduct(req, res) {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 401, {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            });
        }
        if (req.user.role !== "vendor" && req.user.role !== "admin") {
            return (0, apiResponse_1.sendError)(res, 403, {
                code: "FORBIDDEN",
                message: "Only vendors can create products",
            });
        }
        const { name, make, category, price, priceValue, year, mileage, color, image, images, specs, description, inStock, stockQuantity, } = req.body;
        if (!name || !make || !category || !price || !image) {
            return (0, apiResponse_1.sendError)(res, 400, {
                code: "VALIDATION_ERROR",
                message: "Name, make, category, price, and image are required",
            });
        }
        const vendor = await User_1.User.findById(req.user.id).select("name companyName");
        if (!vendor) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "Vendor not found",
            });
        }
        const product = new Product_1.Product({
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
        return (0, apiResponse_1.sendSuccess)(res, 201, product);
    }
    catch (error) {
        console.error("Error creating product:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to create product",
        });
    }
}
async function getVendorProducts(req, res) {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 401, {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            });
        }
        const products = await Product_1.Product.find({ vendorId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        return (0, apiResponse_1.sendSuccess)(res, 200, { products });
    }
    catch (error) {
        console.error("Error fetching vendor products:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch products",
        });
    }
}
async function getAllProducts(req, res) {
    try {
        const { category } = req.query;
        const query = {};
        if (category && (category === "vehicle" || category === "part")) {
            query.category = category;
        }
        const products = await Product_1.Product.find({ ...query })
            .sort({ createdAt: -1 })
            .lean();
        return (0, apiResponse_1.sendSuccess)(res, 200, { products });
    }
    catch (error) {
        console.error("Error fetching all products:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch products",
        });
    }
}
async function getProduct(req, res) {
    try {
        const { id } = req.params;
        const product = await Product_1.Product.findById(id).lean();
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "Product not found",
            });
        }
        return (0, apiResponse_1.sendSuccess)(res, 200, product);
    }
    catch (error) {
        console.error("Error fetching product:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch product",
        });
    }
}
async function updateProduct(req, res) {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 401, {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            });
        }
        const { id } = req.params;
        const product = await Product_1.Product.findById(id);
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "Product not found",
            });
        }
        if (product.vendorId.toString() !== req.user.id &&
            req.user.role !== "admin") {
            return (0, apiResponse_1.sendError)(res, 403, {
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
                product[field] = req.body[field];
            }
        });
        await product.save();
        return (0, apiResponse_1.sendSuccess)(res, 200, product);
    }
    catch (error) {
        console.error("Error updating product:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to update product",
        });
    }
}
async function deleteProduct(req, res) {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 401, {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            });
        }
        const { id } = req.params;
        const product = await Product_1.Product.findById(id);
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "Product not found",
            });
        }
        if (product.vendorId.toString() !== req.user.id &&
            req.user.role !== "admin") {
            return (0, apiResponse_1.sendError)(res, 403, {
                code: "FORBIDDEN",
                message: "You can only delete your own products",
            });
        }
        await Product_1.Product.findByIdAndDelete(id);
        return (0, apiResponse_1.sendSuccess)(res, 200, { message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to delete product",
        });
    }
}
