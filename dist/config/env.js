"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const errors_1 = require("../utils/errors");
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new errors_1.ApiError(500, "CONFIG_MISSING", `${name} is not set`);
    }
    return value;
}
function optional(name) {
    return process.env[name];
}
function toInt(value, fallback) {
    if (!value)
        return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}
exports.env = {
    nodeEnv: optional("NODE_ENV") ?? "development",
    port: toInt(optional("PORT"), 4000),
    mongoUri: required("MONGO_URI"),
    frontendUrl: required("FRONTEND_URL"),
    accessTokenSecret: required("JWT_ACCESS_SECRET"),
    accessTokenTtlSeconds: toInt(optional("JWT_ACCESS_TTL_SECONDS"), 900),
    refreshTokenTtlDays: toInt(optional("REFRESH_TOKEN_TTL_DAYS"), 7),
    bcryptSaltRounds: toInt(optional("BCRYPT_SALT_ROUNDS"), 12),
    cookieDomain: optional("COOKIE_DOMAIN"),
    cookieSameSite: (optional("COOKIE_SAMESITE") ?? "lax"),
    oauthStateSecret: required("OAUTH_STATE_SECRET"),
    googleClientId: optional("GOOGLE_CLIENT_ID"),
    googleClientSecret: optional("GOOGLE_CLIENT_SECRET"),
    googleRedirectUri: optional("GOOGLE_REDIRECT_URI"),
    smtpHost: optional("SMTP_HOST"),
    smtpPort: toInt(optional("SMTP_PORT"), 465),
    smtpUser: optional("SMTP_USER"),
    smtpPass: optional("SMTP_PASS"),
    smtpFrom: optional("SMTP_FROM"),
};
