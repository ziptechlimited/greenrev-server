import type { Response } from "express";
import { AcquisitionRequest } from "../models/AcquisitionRequest";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Review } from "../models/Review";
import type { CustomReq } from "../types/auth";
import { sendSuccess, sendError } from "../utils/apiResponse";

// ─── Customer: Create a request ──────────────────────────────────────────────
export async function createRequest(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
    }
    if (req.user.role !== "customer") {
      return sendError(res, 403, { code: "FORBIDDEN", message: "Only customers can place acquisition requests" });
    }

    const { productId, message } = req.body;

    if (!productId) {
      return sendError(res, 400, { code: "VALIDATION_ERROR", message: "Product ID is required" });
    }

    // Fetch product + vendor info
    const product = await Product.findById(productId).lean();
    if (!product) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Product not found" });
    }

    const vendor = await User.findById(product.vendorId).select("name companyName email phone").lean();
    if (!vendor) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Vendor not found" });
    }

    const customer = await User.findById(req.user.id).select("name email phone").lean();
    if (!customer) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Customer not found" });
    }

    // Check for an existing active request for same product
    const existing = await AcquisitionRequest.findOne({
      customerId: req.user.id,
      productId,
      status: { $in: ["pending", "accepted", "in_progress"] },
    });
    if (existing) {
      return sendError(res, 409, {
        code: "DUPLICATE_REQUEST",
        message: "You already have an active request for this product",
      });
    }

    const acquisitionRequest = new AcquisitionRequest({
      customerId: req.user.id,
      customerName: customer.name || "Customer",
      customerEmail: customer.email,
      customerPhone: (customer as any).phone || null,
      vendorId: product.vendorId,
      vendorName: (vendor as any).name || (vendor as any).companyName || "Vendor",
      vendorEmail: (vendor as any).email,
      vendorPhone: (vendor as any).phone || null,
      vendorCompanyName: (vendor as any).companyName || null,
      productId,
      productName: product.name,
      productImage: product.image,
      productPrice: product.price,
      productMake: product.make || null,
      message: message || null,
      status: "pending",
    });

    await acquisitionRequest.save();

    return sendSuccess(res, 201, {
      request: acquisitionRequest,
      vendorContact: {
        name: (vendor as any).name || (vendor as any).companyName,
        email: (vendor as any).email,
        phone: (vendor as any).phone || null,
        companyName: (vendor as any).companyName || null,
      },
    });
  } catch (error) {
    console.error("Error creating acquisition request:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to create acquisition request" });
  }
}

// ─── Customer: Get their requests ────────────────────────────────────────────
export async function getCustomerRequests(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
    }

    const requests = await AcquisitionRequest.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach review data
    const requestIds = requests.map((r) => r._id);
    const reviews = await Review.find({ acquisitionRequestId: { $in: requestIds } }).lean();
    const reviewMap = new Map(reviews.map((rv) => [rv.acquisitionRequestId!.toString(), rv]));

    const enriched = requests.map((r) => ({
      ...r,
      review: reviewMap.get((r._id as any).toString()) || null,
    }));

    return sendSuccess(res, 200, { requests: enriched });
  } catch (error) {
    console.error("Error fetching customer requests:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to fetch requests" });
  }
}

// ─── Vendor: Get their incoming requests ────────────────────────────────────
export async function getVendorRequests(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
    }
    if (req.user.role !== "vendor" && req.user.role !== "admin") {
      return sendError(res, 403, { code: "FORBIDDEN", message: "Vendor access only" });
    }

    const requests = await AcquisitionRequest.find({ vendorId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, { requests });
  } catch (error) {
    console.error("Error fetching vendor requests:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to fetch requests" });
  }
}

// ─── Vendor: Get pending count (for notification badge) ─────────────────────
export async function getVendorRequestCount(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
    }
    if (req.user.role !== "vendor" && req.user.role !== "admin") {
      return sendError(res, 403, { code: "FORBIDDEN", message: "Vendor access only" });
    }

    const count = await AcquisitionRequest.countDocuments({
      vendorId: req.user.id,
      status: "pending",
    });

    return sendSuccess(res, 200, { count });
  } catch (error) {
    console.error("Error fetching vendor request count:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to fetch count" });
  }
}

// ─── Shared: Update status ───────────────────────────────────────────────────
export async function updateStatus(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "in_progress", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, 400, { code: "VALIDATION_ERROR", message: "Invalid status value" });
    }

    const request = await AcquisitionRequest.findById(id);
    if (!request) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Request not found" });
    }

    const isCustomer = request.customerId.toString() === req.user.id;
    const isVendor = request.vendorId.toString() === req.user.id;

    if (!isCustomer && !isVendor && req.user.role !== "admin") {
      return sendError(res, 403, { code: "FORBIDDEN", message: "Not authorized to update this request" });
    }

    // Role-based status rules
    if (isCustomer && !["in_progress", "cancelled"].includes(status)) {
      return sendError(res, 403, { code: "FORBIDDEN", message: "Customers can only set status to in_progress or cancelled" });
    }
    if (isVendor && !["accepted", "in_progress", "completed", "cancelled"].includes(status)) {
      return sendError(res, 403, { code: "FORBIDDEN", message: "Vendors cannot set this status" });
    }
    if (request.status === "completed" || request.status === "cancelled") {
      return sendError(res, 400, { code: "INVALID_STATE", message: "Cannot update a completed or cancelled request" });
    }

    request.status = status;
    if (status === "accepted") request.acceptedAt = new Date();
    if (status === "completed") request.completedAt = new Date();
    if (status === "cancelled") request.cancelledAt = new Date();
    if (isVendor) request.vendorSeen = true;

    await request.save();

    return sendSuccess(res, 200, { request });
  } catch (error) {
    console.error("Error updating request status:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to update status" });
  }
}

// ─── Vendor: Mark transaction complete ──────────────────────────────────────
export async function completeTransaction(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
    }
    if (req.user.role !== "vendor" && req.user.role !== "admin") {
      return sendError(res, 403, { code: "FORBIDDEN", message: "Vendor access only" });
    }

    const { id } = req.params;

    const request = await AcquisitionRequest.findOne({
      _id: id,
      vendorId: req.user.id,
    });
    if (!request) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Request not found" });
    }
    if (request.status === "cancelled") {
      return sendError(res, 400, { code: "INVALID_STATE", message: "Cannot complete a cancelled request" });
    }
    if (request.status === "completed") {
      return sendError(res, 400, { code: "INVALID_STATE", message: "Request is already completed" });
    }

    request.status = "completed";
    request.completedAt = new Date();
    request.vendorSeen = true;
    await request.save();

    return sendSuccess(res, 200, { request });
  } catch (error) {
    console.error("Error completing transaction:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to complete transaction" });
  }
}
