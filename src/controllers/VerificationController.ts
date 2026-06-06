import type { Response } from "express";
import { VerificationRequest } from "../models/VerificationRequest";
import { User } from "../models/User";
import type { CustomReq } from "../types/auth";
import { ApiError } from "../utils/errors";

export const VerificationController = {
  async submitIndividual(req: CustomReq, res: Response) {
    const userId = req.user?.id;
    const { nin, selfieUrl } = req.body;

    if (!nin || !selfieUrl) {
      throw new ApiError(400, "BAD_REQUEST", "NIN and selfieUrl are required");
    }

    const existingRequest = await VerificationRequest.findOne({ user: userId, status: { $in: ["pending", "info_requested"] } });
    if (existingRequest) {
      throw new ApiError(400, "BAD_REQUEST", "You already have a pending verification request.");
    }

    const newRequest = await VerificationRequest.create({
      user: userId,
      levelRequested: "individual",
      nin,
      selfieUrl,
    });

    await User.findByIdAndUpdate(userId, { verificationStatus: "pending" });

    res.status(201).json({ success: true, data: { request: newRequest } });
  },

  async submitBusiness(req: CustomReq, res: Response) {
    const userId = req.user?.id;
    const { cacNumber, cacDocumentUrl, directorIdUrl, businessAddress, bankAccountNumber, bankCode } = req.body;

    if (!cacNumber || !cacDocumentUrl || !directorIdUrl || !businessAddress) {
      throw new ApiError(400, "BAD_REQUEST", "Missing required business verification fields");
    }

    const existingRequest = await VerificationRequest.findOne({ user: userId, status: { $in: ["pending", "info_requested"] } });
    if (existingRequest) {
      throw new ApiError(400, "BAD_REQUEST", "You already have a pending verification request.");
    }

    const newRequest = await VerificationRequest.create({
      user: userId,
      levelRequested: "business",
      cacNumber,
      cacDocumentUrl,
      directorIdUrl,
      businessAddress,
      bankAccountNumber,
      bankCode,
    });

    await User.findByIdAndUpdate(userId, { verificationStatus: "pending" });

    res.status(201).json({ success: true, data: { request: newRequest } });
  },

  async getStatus(req: CustomReq, res: Response) {
    const userId = req.user?.id;
    const request = await VerificationRequest.findOne({ user: userId }).sort({ createdAt: -1 });
    
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
