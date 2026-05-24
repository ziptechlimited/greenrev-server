"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const errors_1 = require("../utils/errors");
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
function extractAccessToken(req) {
    const cookieToken = req.cookies?.access_token ?? undefined;
    if (cookieToken)
        return cookieToken;
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return undefined;
    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token)
        return undefined;
    return token;
}
async function requireAuth(req, _res, next) {
    try {
        const token = extractAccessToken(req);
        if (!token) {
            next(new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required"));
            return;
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await User_1.User.findById(payload.sub).lean();
        if (!user) {
            next(new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required"));
            return;
        }
        req.user = {
            id: String(user._id),
            email: user.email,
            role: user.role,
            name: user.name ?? null,
            isEmailVerified: Boolean(user.isEmailVerified),
        };
        next();
    }
    catch {
        next(new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required"));
    }
}
function requireRole(roles) {
    return (req, _res, next) => {
        const role = req.user?.role;
        if (!role) {
            next(new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required"));
            return;
        }
        if (!roles.includes(role)) {
            next(new errors_1.ApiError(403, "FORBIDDEN", "Insufficient permissions"));
            return;
        }
        next();
    };
}
