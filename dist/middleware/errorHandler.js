"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const apiResponse_1 = require("../utils/apiResponse");
const errors_1 = require("../utils/errors");
function notFoundHandler(req, res) {
    (0, apiResponse_1.sendError)(res, 404, { code: "NOT_FOUND", message: `Not Found - ${req.originalUrl}` });
}
function errorHandler(err, _req, res, _next) {
    if (err instanceof errors_1.ApiError) {
        (0, apiResponse_1.sendError)(res, err.status, { code: err.code, message: err.message, details: err.details });
        return;
    }
    const message = err instanceof Error ? err.message : "Internal Server Error";
    (0, apiResponse_1.sendError)(res, 500, { code: "INTERNAL_ERROR", message });
}
