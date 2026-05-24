"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomToken = randomToken;
exports.sha256Base64Url = sha256Base64Url;
exports.hmacSha256Base64Url = hmacSha256Base64Url;
const crypto_1 = __importDefault(require("crypto"));
function randomToken(bytes = 48) {
    return crypto_1.default.randomBytes(bytes).toString("base64url");
}
function sha256Base64Url(value) {
    return crypto_1.default.createHash("sha256").update(value).digest("base64url");
}
function hmacSha256Base64Url(secret, value) {
    return crypto_1.default.createHmac("sha256", secret).update(value).digest("base64url");
}
