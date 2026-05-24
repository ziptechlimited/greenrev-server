"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slidingWindowRateLimit = slidingWindowRateLimit;
const errors_1 = require("../utils/errors");
function slidingWindowRateLimit(options) {
    const hits = new Map();
    const keyGenerator = options.keyGenerator ??
        ((req) => req.ip ?? req.headers["x-forwarded-for"] ?? "unknown");
    return (req, _res, next) => {
        const now = Date.now();
        const key = keyGenerator(req);
        const windowStart = now - options.windowMs;
        const prev = hits.get(key) ?? [];
        const filtered = prev.filter((t) => t > windowStart);
        filtered.push(now);
        hits.set(key, filtered);
        if (filtered.length > options.max) {
            next(new errors_1.ApiError(429, "RATE_LIMITED", "Too many requests"));
            return;
        }
        next();
    };
}
