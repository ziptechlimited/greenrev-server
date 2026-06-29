"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRegister = adminRegister;
exports.register = register;
exports.login = login;
exports.me = me;
exports.refresh = refresh;
exports.logout = logout;
exports.verifyEmail = verifyEmail;
exports.resendVerification = resendVerification;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.googleStart = googleStart;
exports.googleCallback = googleCallback;
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const AuthToken_1 = require("../models/AuthToken");
const RefreshToken_1 = require("../models/RefreshToken");
const errors_1 = require("../utils/errors");
const apiResponse_1 = require("../utils/apiResponse");
const password_1 = require("../utils/password");
const crypto_1 = require("../utils/crypto");
const jwt_1 = require("../utils/jwt");
const cookies_1 = require("../utils/cookies");
const tokenService_1 = require("../services/tokenService");
const emailService_1 = require("../services/emailService");
const emailTemplates_1 = require("../utils/emailTemplates");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function publicUser(user) {
    return {
        id: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name ?? null,
        companyName: user.companyName ?? null,
        garageName: user.garageName ?? null,
        isEmailVerified: Boolean(user.isEmailVerified),
    };
}
function setAuthCookies(res, input) {
    res.cookie("access_token", input.accessToken, {
        ...(0, cookies_1.baseCookieOptions)(),
        maxAge: env_1.env.accessTokenTtlSeconds * 1000,
    });
    res.cookie("refresh_token", input.refreshToken, {
        ...(0, cookies_1.baseCookieOptions)(),
        maxAge: env_1.env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    });
    res.cookie("csrf_token", input.csrfToken, {
        ...(0, cookies_1.csrfCookieOptions)(),
        maxAge: env_1.env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    });
}
function clearAuthCookies(res) {
    res.clearCookie("access_token", { ...(0, cookies_1.baseCookieOptions)() });
    res.clearCookie("refresh_token", { ...(0, cookies_1.baseCookieOptions)() });
    res.clearCookie("csrf_token", { ...(0, cookies_1.csrfCookieOptions)() });
}
async function adminRegister(req, res) {
    const { email, password, name, activationCode } = req.body;
    if (typeof email !== "string" || !emailRegex.test(email)) {
        throw new errors_1.ApiError(400, "INVALID_EMAIL", "Invalid email");
    }
    if (typeof password !== "string") {
        throw new errors_1.ApiError(400, "INVALID_PASSWORD", "Invalid password");
    }
    if (typeof activationCode !== "string" || activationCode !== "GREENREV") {
        throw new errors_1.ApiError(403, "INVALID_ACTIVATION_CODE", "Invalid activation code");
    }
    if (name !== undefined && name !== null && typeof name !== "string") {
        throw new errors_1.ApiError(400, "INVALID_NAME", "Invalid name");
    }
    try {
        (0, password_1.assertStrongPassword)(password);
    }
    catch (e) {
        throw new errors_1.ApiError(400, "WEAK_PASSWORD", e.message);
    }
    const existing = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new errors_1.ApiError(409, "EMAIL_IN_USE", "Email already in use");
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await User_1.User.create({
        email: email.toLowerCase(),
        passwordHash,
        role: "admin",
        name: typeof name === "string" ? name : null,
        isEmailVerified: false,
    });
    const verifyPin = Math.floor(100000 + Math.random() * 900000).toString();
    await AuthToken_1.AuthToken.create({
        userId: user._id,
        type: "email_verify",
        tokenHash: (0, crypto_1.sha256Base64Url)(verifyPin),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await (0, emailService_1.sendEmail)({
        to: user.email,
        subject: "Verify your admin email",
        html: (0, emailTemplates_1.getVerificationEmailTemplate)(verifyPin),
    });
    return (0, apiResponse_1.sendSuccess)(res, 201, { user: publicUser(user) });
}
async function register(req, res) {
    const { email, password, role, name, companyName, garageName } = req.body;
    if (typeof email !== "string" || !emailRegex.test(email)) {
        throw new errors_1.ApiError(400, "INVALID_EMAIL", "Invalid email");
    }
    if (typeof password !== "string") {
        throw new errors_1.ApiError(400, "INVALID_PASSWORD", "Invalid password");
    }
    if (typeof role !== "string" ||
        !["customer", "vendor", "mechanic", "admin"].includes(role)) {
        throw new errors_1.ApiError(400, "INVALID_ROLE", "Invalid role");
    }
    if (name !== undefined && name !== null && typeof name !== "string") {
        throw new errors_1.ApiError(400, "INVALID_NAME", "Invalid name");
    }
    if (companyName !== undefined &&
        companyName !== null &&
        typeof companyName !== "string") {
        throw new errors_1.ApiError(400, "INVALID_COMPANY", "Invalid company name");
    }
    if (garageName !== undefined &&
        garageName !== null &&
        typeof garageName !== "string") {
        throw new errors_1.ApiError(400, "INVALID_GARAGE", "Invalid garage name");
    }
    if (role === "vendor" &&
        (!companyName ||
            typeof companyName !== "string" ||
            companyName.trim().length < 2)) {
        throw new errors_1.ApiError(400, "INVALID_COMPANY", "Company name is required");
    }
    if (role === "mechanic" &&
        (!garageName ||
            typeof garageName !== "string" ||
            garageName.trim().length < 2)) {
        throw new errors_1.ApiError(400, "INVALID_GARAGE", "Garage name is required");
    }
    try {
        (0, password_1.assertStrongPassword)(password);
    }
    catch (e) {
        throw new errors_1.ApiError(400, "WEAK_PASSWORD", e.message);
    }
    const existing = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new errors_1.ApiError(409, "EMAIL_IN_USE", "Email already in use");
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await User_1.User.create({
        email: email.toLowerCase(),
        passwordHash,
        role: role,
        name: typeof name === "string" ? name : null,
        companyName: typeof companyName === "string" ? companyName : null,
        garageName: typeof garageName === "string" ? garageName : null,
        isEmailVerified: false,
    });
    const verifyPin = Math.floor(100000 + Math.random() * 900000).toString();
    await AuthToken_1.AuthToken.create({
        userId: user._id,
        type: "email_verify",
        tokenHash: (0, crypto_1.sha256Base64Url)(verifyPin),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await (0, emailService_1.sendEmail)({
        to: user.email,
        subject: "Verify your email",
        html: (0, emailTemplates_1.getVerificationEmailTemplate)(verifyPin),
    });
    return (0, apiResponse_1.sendSuccess)(res, 201, { user: publicUser(user) });
}
async function login(req, res) {
    const { email, password } = req.body;
    if (typeof email !== "string" || !emailRegex.test(email)) {
        throw new errors_1.ApiError(400, "INVALID_EMAIL", "Invalid email");
    }
    if (typeof password !== "string") {
        throw new errors_1.ApiError(400, "INVALID_PASSWORD", "Invalid password");
    }
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
        throw new errors_1.ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }
    const ok = await (0, password_1.verifyPassword)(password, user.passwordHash);
    if (!ok) {
        throw new errors_1.ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }
    if (!user.isEmailVerified) {
        throw new errors_1.ApiError(403, "EMAIL_NOT_VERIFIED", "Email not verified");
    }
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: String(user._id),
        role: user.role,
    });
    const { refreshToken, csrfToken } = await (0, tokenService_1.createRefreshTokenRecord)(String(user._id));
    setAuthCookies(res, { accessToken, refreshToken, csrfToken });
    return (0, apiResponse_1.sendSuccess)(res, 200, { user: publicUser(user), csrfToken });
}
async function me(req, res) {
    if (!req.user) {
        throw new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    return (0, apiResponse_1.sendSuccess)(res, 200, { user: req.user });
}
async function refresh(req, res) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
        throw new errors_1.ApiError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }
    const { refreshToken: newRefresh, csrfToken, userId, } = await (0, tokenService_1.rotateRefreshToken)(refreshToken);
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: String(user._id),
        role: user.role,
    });
    setAuthCookies(res, { accessToken, refreshToken: newRefresh, csrfToken });
    return (0, apiResponse_1.sendSuccess)(res, 200, { user: publicUser(user), csrfToken });
}
async function logout(req, res) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
        const record = await (0, tokenService_1.getValidRefreshTokenRecord)(refreshToken);
        if (record) {
            record.revokedAt = new Date();
            await record.save();
        }
    }
    clearAuthCookies(res);
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
}
async function verifyEmail(req, res) {
    const { pin, email } = req.body;
    if (typeof pin !== "string" || pin.length !== 6) {
        throw new errors_1.ApiError(400, "INVALID_PIN", "Invalid PIN");
    }
    if (typeof email !== "string" || !emailRegex.test(email)) {
        throw new errors_1.ApiError(400, "INVALID_EMAIL", "Invalid email");
    }
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new errors_1.ApiError(400, "INVALID_PIN", "Invalid PIN or email");
    }
    const tokenHash = (0, crypto_1.sha256Base64Url)(pin);
    const record = await AuthToken_1.AuthToken.findOne({ tokenHash, type: "email_verify", userId: user._id });
    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
        throw new errors_1.ApiError(400, "INVALID_PIN", "Invalid PIN");
    }
    user.isEmailVerified = true;
    await user.save();
    record.usedAt = new Date();
    await record.save();
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
}
async function resendVerification(req, res) {
    const { email } = req.body;
    if (typeof email !== "string" || !emailRegex.test(email)) {
        throw new errors_1.ApiError(400, "INVALID_EMAIL", "Invalid email");
    }
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
    }
    if (user.isEmailVerified) {
        return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
    }
    const verifyPin = Math.floor(100000 + Math.random() * 900000).toString();
    await AuthToken_1.AuthToken.create({
        userId: user._id,
        type: "email_verify",
        tokenHash: (0, crypto_1.sha256Base64Url)(verifyPin),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await (0, emailService_1.sendEmail)({
        to: user.email,
        subject: "Verify your email",
        html: (0, emailTemplates_1.getVerificationEmailTemplate)(verifyPin),
    });
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
}
async function forgotPassword(req, res) {
    const { email } = req.body;
    if (typeof email !== "string" || !emailRegex.test(email)) {
        throw new errors_1.ApiError(400, "INVALID_EMAIL", "Invalid email");
    }
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
    }
    const resetToken = (0, crypto_1.randomToken)(48);
    await AuthToken_1.AuthToken.create({
        userId: user._id,
        type: "password_reset",
        tokenHash: (0, crypto_1.sha256Base64Url)(resetToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const resetUrl = `${env_1.env.frontendUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(resetToken)}`;
    await (0, emailService_1.sendEmail)({
        to: user.email,
        subject: "Reset your password",
        html: (0, emailTemplates_1.getPasswordResetTemplate)(resetUrl),
    });
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
}
async function resetPassword(req, res) {
    const { token, newPassword } = req.body;
    if (typeof token !== "string" || token.length < 20) {
        throw new errors_1.ApiError(400, "INVALID_TOKEN", "Invalid token");
    }
    if (typeof newPassword !== "string") {
        throw new errors_1.ApiError(400, "INVALID_PASSWORD", "Invalid password");
    }
    try {
        (0, password_1.assertStrongPassword)(newPassword);
    }
    catch (e) {
        throw new errors_1.ApiError(400, "WEAK_PASSWORD", e.message);
    }
    const tokenHash = (0, crypto_1.sha256Base64Url)(token);
    const record = await AuthToken_1.AuthToken.findOne({ tokenHash, type: "password_reset" });
    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
        throw new errors_1.ApiError(400, "INVALID_TOKEN", "Invalid token");
    }
    const user = await User_1.User.findById(record.userId);
    if (!user || !user.passwordHash) {
        throw new errors_1.ApiError(400, "INVALID_TOKEN", "Invalid token");
    }
    user.passwordHash = await (0, password_1.hashPassword)(newPassword);
    await user.save();
    record.usedAt = new Date();
    await record.save();
    await RefreshToken_1.RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    clearAuthCookies(res);
    return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
}
function encodeOAuthState(data) {
    const json = JSON.stringify({ ...data, iat: Date.now() });
    const payload = Buffer.from(json).toString("base64url");
    const sig = (0, crypto_1.hmacSha256Base64Url)(env_1.env.oauthStateSecret, payload);
    return `${payload}.${sig}`;
}
function decodeOAuthState(state) {
    const [payload, sig] = state.split(".");
    if (!payload || !sig)
        throw new errors_1.ApiError(400, "OAUTH_STATE_INVALID", "Invalid state");
    const expected = (0, crypto_1.hmacSha256Base64Url)(env_1.env.oauthStateSecret, payload);
    if (sig !== expected)
        throw new errors_1.ApiError(400, "OAUTH_STATE_INVALID", "Invalid state");
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const data = JSON.parse(json);
    const iat = typeof data.iat === "number" ? data.iat : 0;
    if (Date.now() - iat > 10 * 60 * 1000) {
        throw new errors_1.ApiError(400, "OAUTH_STATE_EXPIRED", "State expired");
    }
    return data;
}
async function googleStart(req, res) {
    if (!env_1.env.googleClientId || !env_1.env.googleRedirectUri) {
        throw new errors_1.ApiError(500, "GOOGLE_OAUTH_NOT_CONFIGURED", "Google OAuth not configured");
    }
    const role = req.query.role ?? "customer";
    if (!["customer", "vendor", "mechanic", "admin"].includes(role)) {
        throw new errors_1.ApiError(400, "INVALID_ROLE", "Invalid role");
    }
    const state = encodeOAuthState({ role, returnTo: req.query.returnTo ?? "/" });
    const params = new URLSearchParams({
        client_id: env_1.env.googleClientId,
        redirect_uri: env_1.env.googleRedirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
        state,
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
async function googleCallback(req, res) {
    if (!env_1.env.googleClientId ||
        !env_1.env.googleClientSecret ||
        !env_1.env.googleRedirectUri) {
        throw new errors_1.ApiError(500, "GOOGLE_OAUTH_NOT_CONFIGURED", "Google OAuth not configured");
    }
    const code = req.query.code;
    const state = req.query.state;
    if (!code || !state) {
        throw new errors_1.ApiError(400, "OAUTH_INVALID", "Invalid OAuth callback");
    }
    const stateData = decodeOAuthState(state);
    const role = stateData.role ?? "customer";
    const returnTo = stateData.returnTo ?? "/";
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: env_1.env.googleClientId,
            client_secret: env_1.env.googleClientSecret,
            redirect_uri: env_1.env.googleRedirectUri,
            grant_type: "authorization_code",
        }),
    });
    if (!tokenRes.ok) {
        throw new errors_1.ApiError(400, "OAUTH_TOKEN_EXCHANGE_FAILED", "OAuth token exchange failed");
    }
    const tokenJson = (await tokenRes.json());
    if (!tokenJson.access_token) {
        throw new errors_1.ApiError(400, "OAUTH_TOKEN_EXCHANGE_FAILED", "OAuth token exchange failed");
    }
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (!profileRes.ok) {
        throw new errors_1.ApiError(400, "OAUTH_PROFILE_FAILED", "OAuth profile fetch failed");
    }
    const profile = (await profileRes.json());
    if (!profile.email || !profile.id) {
        throw new errors_1.ApiError(400, "OAUTH_PROFILE_FAILED", "OAuth profile fetch failed");
    }
    const email = profile.email.toLowerCase();
    let user = await User_1.User.findOne({ email });
    if (!user) {
        user = await User_1.User.create({
            email,
            name: profile.name ?? null,
            role: (["customer", "vendor", "mechanic", "admin"].includes(role)
                ? role
                : "customer"),
            googleId: profile.id,
            passwordHash: null,
            isEmailVerified: Boolean(profile.verified_email ?? true),
        });
    }
    else {
        if (!user.googleId)
            user.googleId = profile.id;
        if (!user.isEmailVerified)
            user.isEmailVerified = Boolean(profile.verified_email ?? true);
        if (!user.name && profile.name)
            user.name = profile.name;
        await user.save();
    }
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: String(user._id),
        role: user.role,
    });
    const { refreshToken, csrfToken } = await (0, tokenService_1.createRefreshTokenRecord)(String(user._id));
    setAuthCookies(res, { accessToken, refreshToken, csrfToken });
    const redirectUrl = new URL(env_1.env.frontendUrl.replace(/\/$/, "") + "/oauth/callback");
    redirectUrl.searchParams.set("returnTo", typeof returnTo === "string" ? returnTo : "/");
    res.redirect(redirectUrl.toString());
}
