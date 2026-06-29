"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.updateUserStatus = updateUserStatus;
exports.updateUserRole = updateUserRole;
exports.updateUserTier = updateUserTier;
exports.deleteUser = deleteUser;
exports.listTransactions = listTransactions;
const User_1 = require("../models/User");
const AcquisitionRequest_1 = require("../models/AcquisitionRequest");
const errors_1 = require("../utils/errors");
const apiResponse_1 = require("../utils/apiResponse");
async function listUsers(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { users, total } = await User_1.User.aggregate([
        { $facet: {
                users: [{ $skip: skip }, { $limit: limit }],
                total: [{ $count: "count" }]
            } }
    ]).then(res => ({
        users: res[0].users,
        total: res[0].total[0]?.count || 0
    }));
    return (0, apiResponse_1.sendSuccess)(res, 200, { users, total, page, limit });
}
async function updateUserStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
        throw new errors_1.ApiError(400, "INVALID_STATUS", "Invalid status value");
    }
    const user = await User_1.User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
        throw new errors_1.ApiError(404, "USER_NOT_FOUND", "User not found");
    }
    return (0, apiResponse_1.sendSuccess)(res, 200, { user });
}
async function updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    if (!["customer", "vendor", "mechanic", "admin"].includes(role)) {
        throw new errors_1.ApiError(400, "INVALID_ROLE", "Invalid role value");
    }
    const user = await User_1.User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
        throw new errors_1.ApiError(404, "USER_NOT_FOUND", "User not found");
    }
    return (0, apiResponse_1.sendSuccess)(res, 200, { user });
}
async function updateUserTier(req, res) {
    const { id } = req.params;
    const { verificationLevel } = req.body;
    if (!["basic", "individual", "business"].includes(verificationLevel)) {
        throw new errors_1.ApiError(400, "INVALID_TIER", "Invalid tier value");
    }
    const user = await User_1.User.findByIdAndUpdate(id, { verificationLevel }, { new: true });
    if (!user) {
        throw new errors_1.ApiError(404, "USER_NOT_FOUND", "User not found");
    }
    return (0, apiResponse_1.sendSuccess)(res, 200, { user });
}
async function deleteUser(req, res) {
    const { id } = req.params;
    const user = await User_1.User.findByIdAndDelete(id);
    if (!user) {
        throw new errors_1.ApiError(404, "USER_NOT_FOUND", "User not found");
    }
    return (0, apiResponse_1.sendSuccess)(res, 204, { ok: true });
}
async function listTransactions(req, res) {
    const { status, userId } = req.query;
    const query = {};
    if (status)
        query.status = status;
    if (userId)
        query.userId = userId;
    const requests = await AcquisitionRequest_1.AcquisitionRequest.find(query).sort({ createdAt: -1 });
    return (0, apiResponse_1.sendSuccess)(res, 200, { requests });
}
