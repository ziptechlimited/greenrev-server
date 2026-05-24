"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshExpiresAt = refreshExpiresAt;
exports.createRefreshTokenRecord = createRefreshTokenRecord;
exports.getValidRefreshTokenRecord = getValidRefreshTokenRecord;
exports.rotateRefreshToken = rotateRefreshToken;
const RefreshToken_1 = require("../models/RefreshToken");
const env_1 = require("../config/env");
const crypto_1 = require("../utils/crypto");
const errors_1 = require("../utils/errors");
function refreshExpiresAt() {
    const ms = env_1.env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms);
}
async function createRefreshTokenRecord(userId) {
    const refreshToken = (0, crypto_1.randomToken)(48);
    const csrfToken = (0, crypto_1.randomToken)(24);
    await RefreshToken_1.RefreshToken.create({
        userId,
        tokenHash: (0, crypto_1.sha256Base64Url)(refreshToken),
        csrfHash: (0, crypto_1.sha256Base64Url)(csrfToken),
        expiresAt: refreshExpiresAt(),
    });
    return { refreshToken, csrfToken };
}
async function getValidRefreshTokenRecord(refreshToken) {
    const tokenHash = (0, crypto_1.sha256Base64Url)(refreshToken);
    const record = await RefreshToken_1.RefreshToken.findOne({ tokenHash });
    if (!record)
        return null;
    if (record.revokedAt)
        return null;
    if (record.expiresAt.getTime() <= Date.now())
        return null;
    return record;
}
async function rotateRefreshToken(oldRefreshToken) {
    const record = await getValidRefreshTokenRecord(oldRefreshToken);
    if (!record) {
        throw new errors_1.ApiError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }
    const userId = String(record.userId);
    const { refreshToken, csrfToken } = await createRefreshTokenRecord(userId);
    record.revokedAt = new Date();
    record.replacedByTokenHash = (0, crypto_1.sha256Base64Url)(refreshToken);
    await record.save();
    return { refreshToken, csrfToken, userId };
}
