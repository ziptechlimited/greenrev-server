"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRequest = sanitizeRequest;
function sanitizeInPlace(value) {
    if (!value || typeof value !== "object")
        return;
    if (Array.isArray(value)) {
        for (const item of value)
            sanitizeInPlace(item);
        return;
    }
    for (const key of Object.keys(value)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete value[key];
            continue;
        }
        sanitizeInPlace(value[key]);
    }
}
function sanitizeRequest(req, _res, next) {
    sanitizeInPlace(req.body);
    sanitizeInPlace(req.query);
    sanitizeInPlace(req.params);
    next();
}
