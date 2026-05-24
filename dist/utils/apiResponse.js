"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, status, data) {
    return res.status(status).json({ success: true, data });
}
function sendError(res, status, error) {
    return res.status(status).json({ success: false, error });
}
