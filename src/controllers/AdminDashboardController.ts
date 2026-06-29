import type { Request, Response } from "express";
import { User } from "../models/User";
import { AcquisitionRequest } from "../models/AcquisitionRequest";
import { AcquisitionEvent } from "../models/AcquisitionEvent";
import { ApiError } from "../utils/errors";
import { sendSuccess } from "../utils/apiResponse";
import type { CustomReq } from "../types/auth";

export async function listUsers(req: CustomReq, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const role = req.query.role as string;
  const skip = (page - 1) * limit;

  const matchStage: any = {};
  if (role) {
    matchStage.role = role;
  }

  const { users, total } = await User.aggregate([
    { $match: matchStage },
    { $facet: {
      users: [{ $skip: skip }, { $limit: limit }],
      total: [{ $count: "count" }]
    }}
  ]).then(res => ({
    users: res[0].users,
    total: res[0].total[0]?.count || 0
  }));

  return sendSuccess(res, 200, { users, total, page, limit });
}

export async function updateUserStatus(req: CustomReq, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status: string };

  if (!["active", "suspended"].includes(status)) {
    throw new ApiError(400, "INVALID_STATUS", "Invalid status value");
  }

  const user = await User.findByIdAndUpdate(id, { status }, { new: true });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  return sendSuccess(res, 200, { user });
}

export async function updateUserRole(req: CustomReq, res: Response) {
  const { id } = req.params;
  const { role } = req.body as { role: string };

  if (!["customer", "vendor", "mechanic", "admin"].includes(role)) {
    throw new ApiError(400, "INVALID_ROLE", "Invalid role value");
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  return sendSuccess(res, 200, { user });
}

export async function updateUserTier(req: CustomReq, res: Response) {
  const { id } = req.params;
  const { verificationLevel } = req.body as { verificationLevel: string };

  if (!["basic", "individual", "business"].includes(verificationLevel)) {
    throw new ApiError(400, "INVALID_TIER", "Invalid tier value");
  }

  const user = await User.findByIdAndUpdate(id, { verificationLevel }, { new: true });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  return sendSuccess(res, 200, { user });
}

export async function deleteUser(req: CustomReq, res: Response) {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  return sendSuccess(res, 204, { ok: true });
}

export async function listTransactions(req: CustomReq, res: Response) {
  const { status, userId } = req.query;
  const query: any = {};

  if (status) query.status = status;
  if (userId) query.userId = userId;

  const requests = await AcquisitionRequest.find(query).sort({ createdAt: -1 });

  return sendSuccess(res, 200, { requests });
}
