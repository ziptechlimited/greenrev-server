"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseCookieOptions = baseCookieOptions;
exports.csrfCookieOptions = csrfCookieOptions;
const env_1 = require("../config/env");
function baseCookieOptions() {
    const sameSite = env_1.env.cookieSameSite;
    const secure = env_1.env.nodeEnv === "production" || sameSite === "none";
    return {
        httpOnly: true,
        secure,
        sameSite,
        domain: env_1.env.cookieDomain,
        path: "/",
    };
}
function csrfCookieOptions() {
    const sameSite = env_1.env.cookieSameSite;
    const secure = env_1.env.nodeEnv === "production" || sameSite === "none";
    return {
        httpOnly: false,
        secure,
        sameSite,
        domain: env_1.env.cookieDomain,
        path: "/",
    };
}
