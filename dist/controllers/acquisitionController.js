"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequest = createRequest;
exports.getCustomerRequests = getCustomerRequests;
exports.getVendorRequests = getVendorRequests;
exports.getVendorRequestCount = getVendorRequestCount;
exports.vendorAccept = vendorAccept;
exports.uploadReceipt = uploadReceipt;
exports.vendorConfirmPayment = vendorConfirmPayment;
exports.customerConfirmCompleted = customerConfirmCompleted;
const mongoose_1 = __importDefault(require("mongoose"));
const AcquisitionRequest_1 = require("../models/AcquisitionRequest");
const AcquisitionEvent_1 = require("../models/AcquisitionEvent");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const Review_1 = require("../models/Review");
const apiResponse_1 = require("../utils/apiResponse");
const cloudinary_1 = require("../utils/cloudinary");
const emailService_1 = require("../services/emailService");
const emailTemplates_1 = require("../utils/emailTemplates");
// ─── Customer: Create a request ──────────────────────────────────────────────
async function createRequest(req, res) {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 401, {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            });
        }
        if (req.user.role !== "customer") {
            return (0, apiResponse_1.sendError)(res, 403, {
                code: "FORBIDDEN",
                message: "Only customers can place acquisition requests",
            });
        }
        const { productId, quantity, message } = req.body;
        if (!productId) {
            return (0, apiResponse_1.sendError)(res, 400, {
                code: "VALIDATION_ERROR",
                message: "Product ID is required",
            });
        }
        // Fetch product + vendor info
        const product = await Product_1.Product.findById(productId).lean();
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "Product not found",
            });
        }
        const vendor = await User_1.User.findById(product.vendorId)
            .select("name companyName email phone role")
            .lean();
        if (!vendor) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "Vendor not found",
            });
        }
        if (vendor.role !== "vendor") {
            return (0, apiResponse_1.sendError)(res, 400, {
                code: "INVALID_VENDOR",
                message: "Product vendor is not a vendor account",
            });
        }
        const customer = await User_1.User.findById(req.user.id)
            .select("name email phone")
            .lean();
        if (!customer) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "Customer not found",
            });
        }
        // Check for an existing active request for same product if it's a vehicle
        if (product.category === "vehicle") {
            const existing = await AcquisitionRequest_1.AcquisitionRequest.findOne({
                customerId: req.user.id,
                productId,
                status: {
                    $in: ["pending", "accepted", "receipt_uploaded", "payment_confirmed"],
                },
            });
            if (existing) {
                return (0, apiResponse_1.sendError)(res, 409, {
                    code: "DUPLICATE_REQUEST",
                    message: "You already have an active request for this product",
                });
            }
        }
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const created = await AcquisitionRequest_1.AcquisitionRequest.create([
                {
                    customerId: req.user.id,
                    customerName: customer.name || "Customer",
                    customerEmail: customer.email,
                    customerPhone: customer.phone || null,
                    vendorId: product.vendorId,
                    vendorName: vendor.name || vendor.companyName || "Vendor",
                    vendorEmail: vendor.email,
                    vendorPhone: vendor.phone || null,
                    vendorCompanyName: vendor.companyName || null,
                    productId,
                    productName: product.name,
                    productImage: product.image,
                    productPrice: product.price,
                    productMake: product.make || null,
                    quantity: quantity || 1,
                    message: message || null,
                    status: "pending",
                },
            ], { session });
            await AcquisitionEvent_1.AcquisitionEvent.create([
                {
                    requestId: created[0]._id,
                    actorId: req.user.id,
                    actorRole: req.user.role,
                    action: "created",
                    fromStatus: null,
                    toStatus: "pending",
                    metadata: null,
                },
            ], { session });
            await session.commitTransaction();
            // Send email to vendor
            try {
                await (0, emailService_1.sendEmail)({
                    to: vendor.email,
                    subject: "New Acquisition Request on GreenRev",
                    html: (0, emailTemplates_1.getNewAcquisitionRequestTemplate)(customer.name || "Customer", product.name),
                });
            }
            catch (emailErr) {
                console.error("Failed to send vendor notification email:", emailErr);
            }
            return (0, apiResponse_1.sendSuccess)(res, 201, { request: created[0] });
        }
        catch (e) {
            await session.abortTransaction();
            throw e;
        }
        finally {
            session.endSession();
        }
    }
    catch (error) {
        console.error("Error creating acquisition request:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to create acquisition request",
        });
    }
}
function canRevealVendorContact(status) {
    return status !== "pending";
}
// ─── Customer: Get their requests ────────────────────────────────────────────
async function getCustomerRequests(req, res) {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 401, {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            });
        }
        const requests = await AcquisitionRequest_1.AcquisitionRequest.find({ customerId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        // Attach review data
        const requestIds = requests.map((r) => r._id);
        const reviews = await Review_1.Review.find({
            acquisitionRequestId: { $in: requestIds },
        }).lean();
        const reviewMap = new Map(reviews.map((rv) => [rv.acquisitionRequestId.toString(), rv]));
        const enriched = requests.map((r) => {
            const reveal = canRevealVendorContact(r.status);
            return {
                ...r,
                vendorEmail: reveal ? r.vendorEmail : null,
                vendorPhone: reveal ? r.vendorPhone : null,
                vendorCompanyName: reveal ? r.vendorCompanyName : null,
                review: reviewMap.get(r._id.toString()) || null,
            };
        });
        return (0, apiResponse_1.sendSuccess)(res, 200, { requests: enriched });
    }
    catch (error) {
        console.error("Error fetching customer requests:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch requests",
        });
    }
}
// ─── Vendor: Get their incoming requests ────────────────────────────────────
async function getVendorRequests(req, res) {
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
                message: "Vendor access only",
            });
        }
        const requests = await AcquisitionRequest_1.AcquisitionRequest.find({ vendorId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        return (0, apiResponse_1.sendSuccess)(res, 200, { requests });
    }
    catch (error) {
        console.error("Error fetching vendor requests:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch requests",
        });
    }
}
// ─── Vendor: Get pending count (for notification badge) ─────────────────────
async function getVendorRequestCount(req, res) {
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
                message: "Vendor access only",
            });
        }
        const count = await AcquisitionRequest_1.AcquisitionRequest.countDocuments({
            vendorId: req.user.id,
            status: "pending",
        });
        return (0, apiResponse_1.sendSuccess)(res, 200, { count });
    }
    catch (error) {
        console.error("Error fetching vendor request count:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch count",
        });
    }
}
async function vendorAccept(req, res) {
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
                message: "Vendor access only",
            });
        }
        const { id } = req.params;
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const updated = await AcquisitionRequest_1.AcquisitionRequest.findOneAndUpdate({ _id: id, vendorId: req.user.id, status: "pending" }, {
                $set: {
                    status: "accepted",
                    acceptedAt: new Date(),
                    vendorSeen: true,
                },
            }, { new: true, session });
            if (!updated) {
                await session.abortTransaction();
                return (0, apiResponse_1.sendError)(res, 400, {
                    code: "INVALID_STATE",
                    message: "Request cannot be accepted",
                });
            }
            await AcquisitionEvent_1.AcquisitionEvent.create([
                {
                    requestId: updated._id,
                    actorId: req.user.id,
                    actorRole: req.user.role,
                    action: "vendor_accepted",
                    fromStatus: "pending",
                    toStatus: "accepted",
                    metadata: null,
                },
            ], { session });
            await session.commitTransaction();
            return (0, apiResponse_1.sendSuccess)(res, 200, { request: updated });
        }
        catch (e) {
            await session.abortTransaction();
            throw e;
        }
        finally {
            session.endSession();
        }
    }
    catch (error) {
        console.error("Error accepting request:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to accept request",
        });
    }
}
async function uploadReceipt(req, res) {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 401, {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            });
        }
        if (req.user.role !== "customer") {
            return (0, apiResponse_1.sendError)(res, 403, {
                code: "FORBIDDEN",
                message: "Customer access only",
            });
        }
        const { id } = req.params;
        const { receiptImageBase64 } = req.body;
        if (!receiptImageBase64 ||
            typeof receiptImageBase64 !== "string") {
            return (0, apiResponse_1.sendError)(res, 400, {
                code: "VALIDATION_ERROR",
                message: "Receipt image is required",
            });
        }
        let receiptUrl = "";
        try {
            receiptUrl = await (0, cloudinary_1.uploadImage)(receiptImageBase64, "greenrev_receipts");
        }
        catch (err) {
            return (0, apiResponse_1.sendError)(res, 500, {
                code: "UPLOAD_ERROR",
                message: "Failed to upload receipt image to Cloudinary",
            });
        }
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const updated = await AcquisitionRequest_1.AcquisitionRequest.findOneAndUpdate({ _id: id, customerId: req.user.id, status: "accepted" }, {
                $set: {
                    status: "receipt_uploaded",
                    receiptUrl,
                    receiptUploadedAt: new Date(),
                },
            }, { new: true, session });
            if (!updated) {
                await session.abortTransaction();
                return (0, apiResponse_1.sendError)(res, 400, {
                    code: "INVALID_STATE",
                    message: "Receipt cannot be uploaded",
                });
            }
            await AcquisitionEvent_1.AcquisitionEvent.create([
                {
                    requestId: updated._id,
                    actorId: req.user.id,
                    actorRole: req.user.role,
                    action: "receipt_uploaded",
                    fromStatus: "accepted",
                    toStatus: "receipt_uploaded",
                    metadata: { receiptUrl },
                },
            ], { session });
            await session.commitTransaction();
            return (0, apiResponse_1.sendSuccess)(res, 200, { request: updated });
        }
        catch (e) {
            await session.abortTransaction();
            throw e;
        }
        finally {
            session.endSession();
        }
    }
    catch (error) {
        console.error("Error uploading receipt:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to upload receipt",
        });
    }
}
async function vendorConfirmPayment(req, res) {
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
                message: "Vendor access only",
            });
        }
        const { id } = req.params;
        const { amount } = req.body;
        const parsed = typeof amount === "number"
            ? amount
            : typeof amount === "string"
                ? Number(amount)
                : NaN;
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return (0, apiResponse_1.sendError)(res, 400, {
                code: "VALIDATION_ERROR",
                message: "Amount must be a positive number",
            });
        }
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const updated = await AcquisitionRequest_1.AcquisitionRequest.findOneAndUpdate({ _id: id, vendorId: req.user.id, status: "receipt_uploaded" }, {
                $set: {
                    status: "payment_confirmed",
                    vendorPaymentAmount: parsed,
                    vendorPaymentConfirmedAt: new Date(),
                    vendorSeen: true,
                },
            }, { new: true, session });
            if (!updated) {
                await session.abortTransaction();
                return (0, apiResponse_1.sendError)(res, 400, {
                    code: "INVALID_STATE",
                    message: "Payment cannot be confirmed",
                });
            }
            await AcquisitionEvent_1.AcquisitionEvent.create([
                {
                    requestId: updated._id,
                    actorId: req.user.id,
                    actorRole: req.user.role,
                    action: "payment_confirmed",
                    fromStatus: "receipt_uploaded",
                    toStatus: "payment_confirmed",
                    metadata: { amount: parsed },
                },
            ], { session });
            await session.commitTransaction();
            return (0, apiResponse_1.sendSuccess)(res, 200, { request: updated });
        }
        catch (e) {
            await session.abortTransaction();
            throw e;
        }
        finally {
            session.endSession();
        }
    }
    catch (error) {
        console.error("Error confirming payment:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to confirm payment",
        });
    }
}
async function customerConfirmCompleted(req, res) {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 401, {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            });
        }
        if (req.user.role !== "customer") {
            return (0, apiResponse_1.sendError)(res, 403, {
                code: "FORBIDDEN",
                message: "Customer access only",
            });
        }
        const { id } = req.params;
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const updated = await AcquisitionRequest_1.AcquisitionRequest.findOneAndUpdate({ _id: id, customerId: req.user.id, status: "payment_confirmed" }, { $set: { status: "completed", completedAt: new Date() } }, { new: true, session });
            if (!updated) {
                await session.abortTransaction();
                return (0, apiResponse_1.sendError)(res, 400, {
                    code: "INVALID_STATE",
                    message: "Transaction cannot be completed",
                });
            }
            await AcquisitionEvent_1.AcquisitionEvent.create([
                {
                    requestId: updated._id,
                    actorId: req.user.id,
                    actorRole: req.user.role,
                    action: "client_completed",
                    fromStatus: "payment_confirmed",
                    toStatus: "completed",
                    metadata: null,
                },
            ], { session });
            await session.commitTransaction();
            return (0, apiResponse_1.sendSuccess)(res, 200, { request: updated });
        }
        catch (e) {
            await session.abortTransaction();
            throw e;
        }
        finally {
            session.endSession();
        }
    }
    catch (error) {
        console.error("Error completing transaction:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Failed to complete transaction",
        });
    }
}
