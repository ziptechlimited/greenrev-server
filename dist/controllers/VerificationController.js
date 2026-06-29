"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const VerificationRequest_1 = require("../models/VerificationRequest");
const User_1 = require("../models/User");
const errors_1 = require("../utils/errors");
const SmileIdentityService_1 = require("../services/SmileIdentityService");
exports.VerificationController = {
    async submitIndividual(req, res) {
        const userId = req.user?.id;
        const { nin, selfieUrl } = req.body;
        if (!nin || !selfieUrl) {
            throw new errors_1.ApiError(400, "BAD_REQUEST", "NIN and selfieUrl are required");
        }
        const existingRequest = await VerificationRequest_1.VerificationRequest.findOne({ user: userId, status: { $in: ["pending", "info_requested"] } });
        if (existingRequest) {
            throw new errors_1.ApiError(400, "BAD_REQUEST", "You already have a pending verification request.");
        }
        // Call Smile ID Mock Service
        const smileResult = await SmileIdentityService_1.SmileIdentityService.verifyIndividual(nin, selfieUrl, userId);
        if (!smileResult.success) {
            // Create rejected record
            await VerificationRequest_1.VerificationRequest.create({
                user: userId,
                levelRequested: "individual",
                nin,
                selfieUrl,
                status: "rejected",
            });
            throw new errors_1.ApiError(400, "VERIFICATION_FAILED", smileResult.message);
        }
        // Auto-approve testing flow
        const newRequest = await VerificationRequest_1.VerificationRequest.create({
            user: userId,
            levelRequested: "individual",
            nin,
            selfieUrl,
            status: "approved",
        });
        await User_1.User.findByIdAndUpdate(userId, {
            verificationStatus: "verified",
            verificationLevel: "individual"
        });
        res.status(201).json({ success: true, data: { request: newRequest } });
    },
    async submitBusiness(req, res) {
        const userId = req.user?.id;
        const { cacNumber, cacDocumentUrl, directorIdUrl, businessAddress, bankAccountNumber, bankCode } = req.body;
        if (!cacNumber || !cacDocumentUrl || !directorIdUrl || !businessAddress) {
            throw new errors_1.ApiError(400, "BAD_REQUEST", "Missing required business verification fields");
        }
        const existingRequest = await VerificationRequest_1.VerificationRequest.findOne({ user: userId, status: { $in: ["pending", "info_requested"] } });
        if (existingRequest) {
            throw new errors_1.ApiError(400, "BAD_REQUEST", "You already have a pending verification request.");
        }
        // Call Smile ID Mock Service
        const smileResult = await SmileIdentityService_1.SmileIdentityService.verifyBusiness(cacNumber, userId);
        if (!smileResult.success) {
            await VerificationRequest_1.VerificationRequest.create({
                user: userId,
                levelRequested: "business",
                cacNumber,
                cacDocumentUrl,
                directorIdUrl,
                businessAddress,
                bankAccountNumber,
                bankCode,
                status: "rejected"
            });
            throw new errors_1.ApiError(400, "VERIFICATION_FAILED", smileResult.message);
        }
        // Auto-approve testing flow
        const newRequest = await VerificationRequest_1.VerificationRequest.create({
            user: userId,
            levelRequested: "business",
            cacNumber,
            cacDocumentUrl,
            directorIdUrl,
            businessAddress,
            bankAccountNumber,
            bankCode,
            status: "approved"
        });
        await User_1.User.findByIdAndUpdate(userId, {
            verificationStatus: "verified",
            verificationLevel: "business"
        });
        res.status(201).json({ success: true, data: { request: newRequest } });
    },
    async getStatus(req, res) {
        const userId = req.user?.id;
        const request = await VerificationRequest_1.VerificationRequest.findOne({ user: userId }).sort({ createdAt: -1 });
        // Fallback to user status if no request found
        let status = req.user?.verificationStatus;
        let level = req.user?.verificationLevel;
        res.status(200).json({
            success: true,
            data: {
                status,
                level,
                latestRequest: request || null,
            },
        });
    },
};
