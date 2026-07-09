"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCsrf = requireCsrf;
const errors_1 = require("../utils/errors");
function requireCsrf(req, _res, next) {
    const method = req.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
        next();
        return;
    }
    const bypassPaths = [
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/admin-register",
        "/api/v1/auth/refresh",
        "/api/v1/auth/logout",
        "/api/v1/auth/password/forgot",
        "/api/v1/auth/password/reset",
        "/api/v1/auth/email/verify",
        "/api/v1/auth/email/resend",
    ];
    if (bypassPaths.includes(req.path)) {
        next();
        return;
    }
    const hasSession = Boolean(req.cookies?.refresh_token);
    if (!hasSession) {
        next();
        return;
    }
    const csrfCookie = req.cookies?.csrf_token;
    const csrfHeader = req.headers["x-csrf-token"] ?? "";
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        next(new errors_1.ApiError(403, "CSRF_INVALID", "CSRF token invalid"));
        return;
    }
    next();
}
