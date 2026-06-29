"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListAcquisitions = adminListAcquisitions;
exports.adminGetAcquisitionEvents = adminGetAcquisitionEvents;
exports.adminFlagAcquisition = adminFlagAcquisition;
exports.adminResolveAcquisition = adminResolveAcquisition;
const mongoose_1 = __importDefault(require("mongoose"));
const AcquisitionRequest_1 = require("../models/AcquisitionRequest");
const AcquisitionEvent_1 = require("../models/AcquisitionEvent");
const apiResponse_1 = require("../utils/apiResponse");
async function adminListAcquisitions(req, res) {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
        if (req.user.role !== "admin")
            return (0, apiResponse_1.sendError)(res, 403, { code: "FORBIDDEN", message: "Admin access only" });
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const flagged = typeof req.query.flagged === "string" ? req.query.flagged : undefined;
        const filter = {};
        if (status)
            filter.status = status;
        if (flagged === "true")
            filter.adminFlaggedAt = { $ne: null };
        if (flagged === "false")
            filter.adminFlaggedAt = null;
        const items = await AcquisitionRequest_1.AcquisitionRequest.find(filter).sort({ createdAt: -1 }).limit(500).lean();
        return (0, apiResponse_1.sendSuccess)(res, 200, { requests: items });
    }
    catch (error) {
        console.error("Error listing acquisitions:", error);
        return (0, apiResponse_1.sendError)(res, 500, { code: "INTERNAL_ERROR", message: "Failed to fetch transactions" });
    }
}
async function adminGetAcquisitionEvents(req, res) {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
        if (req.user.role !== "admin")
            return (0, apiResponse_1.sendError)(res, 403, { code: "FORBIDDEN", message: "Admin access only" });
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return (0, apiResponse_1.sendError)(res, 400, { code: "VALIDATION_ERROR", message: "Invalid id" });
        }
        const events = await AcquisitionEvent_1.AcquisitionEvent.find({ requestId: id }).sort({ createdAt: 1 }).lean();
        return (0, apiResponse_1.sendSuccess)(res, 200, { events });
    }
    catch (error) {
        console.error("Error fetching acquisition events:", error);
        return (0, apiResponse_1.sendError)(res, 500, { code: "INTERNAL_ERROR", message: "Failed to fetch events" });
    }
}
async function adminFlagAcquisition(req, res) {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
        if (req.user.role !== "admin")
            return (0, apiResponse_1.sendError)(res, 403, { code: "FORBIDDEN", message: "Admin access only" });
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
            return (0, apiResponse_1.sendError)(res, 400, { code: "VALIDATION_ERROR", message: "Reason is required" });
        }
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const updated = await AcquisitionRequest_1.AcquisitionRequest.findByIdAndUpdate(id, { $set: { adminFlaggedAt: new Date(), adminFlagReason: reason.trim() } }, { new: true, session });
            if (!updated) {
                await session.abortTransaction();
                return (0, apiResponse_1.sendError)(res, 404, { code: "NOT_FOUND", message: "Transaction not found" });
            }
            await AcquisitionEvent_1.AcquisitionEvent.create([
                {
                    requestId: updated._id,
                    actorId: req.user.id,
                    actorRole: req.user.role,
                    action: "admin_flagged",
                    fromStatus: null,
                    toStatus: null,
                    metadata: { reason: reason.trim() },
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
        console.error("Error flagging acquisition:", error);
        return (0, apiResponse_1.sendError)(res, 500, { code: "INTERNAL_ERROR", message: "Failed to flag transaction" });
    }
}
async function adminResolveAcquisition(req, res) {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
        if (req.user.role !== "admin")
            return (0, apiResponse_1.sendError)(res, 403, { code: "FORBIDDEN", message: "Admin access only" });
        const { id } = req.params;
        const { resolution } = req.body;
        if (!resolution || typeof resolution !== "string" || resolution.trim().length < 3) {
            return (0, apiResponse_1.sendError)(res, 400, { code: "VALIDATION_ERROR", message: "Resolution is required" });
        }
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const updated = await AcquisitionRequest_1.AcquisitionRequest.findByIdAndUpdate(id, { $set: { adminResolvedAt: new Date(), adminResolution: resolution.trim() } }, { new: true, session });
            if (!updated) {
                await session.abortTransaction();
                return (0, apiResponse_1.sendError)(res, 404, { code: "NOT_FOUND", message: "Transaction not found" });
            }
            await AcquisitionEvent_1.AcquisitionEvent.create([
                {
                    requestId: updated._id,
                    actorId: req.user.id,
                    actorRole: req.user.role,
                    action: "admin_resolved",
                    fromStatus: null,
                    toStatus: null,
                    metadata: { resolution: resolution.trim() },
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
        console.error("Error resolving acquisition:", error);
        return (0, apiResponse_1.sendError)(res, 500, { code: "INTERNAL_ERROR", message: "Failed to resolve transaction" });
    }
}
