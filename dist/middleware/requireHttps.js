"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireHttps = requireHttps;
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function requireHttps(req, _res, next) {
    if (env_1.env.nodeEnv !== "production") {
        next();
        return;
    }
    const proto = req.headers["x-forwarded-proto"] ?? "";
    if (proto.toLowerCase() !== "https") {
        next(new errors_1.ApiError(400, "HTTPS_REQUIRED", "HTTPS is required"));
        return;
    }
    next();
}
