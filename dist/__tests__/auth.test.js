"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const crypto_1 = require("../utils/crypto");
const AuthToken_1 = require("../models/AuthToken");
const User_1 = require("../models/User");
let mongo = null;
function cookieValue(setCookieHeader, name) {
    if (!setCookieHeader)
        return undefined;
    const hit = setCookieHeader.find((c) => c.startsWith(`${name}=`));
    if (!hit)
        return undefined;
    return hit.split(";")[0].slice(name.length + 1);
}
describe("auth", () => {
    beforeAll(async () => {
        mongo = await mongodb_memory_server_1.MongoMemoryServer.create();
        process.env.NODE_ENV = "test";
        process.env.MONGO_URI = mongo.getUri();
        process.env.FRONTEND_URL = "http://localhost:3000";
        process.env.JWT_ACCESS_SECRET = "test_access_secret";
        process.env.OAUTH_STATE_SECRET = "test_oauth_state_secret";
        await mongoose_1.default.connect(process.env.MONGO_URI);
    }, 30_000);
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        if (mongo)
            await mongo.stop();
    }, 30_000);
    it("register -> verify email -> login -> me -> refresh", async () => {
        const { createApp } = require("../app");
        const app = createApp();
        const email = "test@example.com";
        const password = "StrongPassw0rd!";
        const reg = await (0, supertest_1.default)(app)
            .post("/api/v1/auth/register")
            .send({ email, password, role: "customer", name: "Test User" });
        expect(reg.status).toBe(201);
        expect(reg.body.success).toBe(true);
        const user = await User_1.User.findOne({ email }).lean();
        expect(user).toBeTruthy();
        const knownToken = "verify-token-1234567890";
        await AuthToken_1.AuthToken.deleteMany({ userId: user._id, type: "email_verify" });
        await AuthToken_1.AuthToken.create({
            userId: user._id,
            type: "email_verify",
            tokenHash: (0, crypto_1.sha256Base64Url)(knownToken),
            expiresAt: new Date(Date.now() + 60_000),
        });
        const verify = await (0, supertest_1.default)(app)
            .post("/api/v1/auth/email/verify")
            .send({ token: knownToken });
        expect(verify.status).toBe(200);
        expect(verify.body.success).toBe(true);
        const login = await (0, supertest_1.default)(app)
            .post("/api/v1/auth/login")
            .send({ email, password });
        expect(login.status).toBe(200);
        expect(login.body.success).toBe(true);
        const rawSetCookie = login.headers["set-cookie"];
        const setCookie = Array.isArray(rawSetCookie)
            ? rawSetCookie
            : typeof rawSetCookie === "string"
                ? [rawSetCookie]
                : undefined;
        const access = cookieValue(setCookie, "access_token");
        const refresh = cookieValue(setCookie, "refresh_token");
        const csrf = cookieValue(setCookie, "csrf_token");
        expect(access).toBeTruthy();
        expect(refresh).toBeTruthy();
        expect(csrf).toBeTruthy();
        const me = await (0, supertest_1.default)(app)
            .get("/api/v1/auth/me")
            .set("Cookie", [`access_token=${access}`]);
        expect(me.status).toBe(200);
        expect(me.body.success).toBe(true);
        const refreshed = await (0, supertest_1.default)(app)
            .post("/api/v1/auth/refresh")
            .set("Cookie", [`refresh_token=${refresh}`, `csrf_token=${csrf}`])
            .set("X-CSRF-Token", csrf);
        expect(refreshed.status).toBe(200);
        expect(refreshed.body.success).toBe(true);
        const rawSetCookie2 = refreshed.headers["set-cookie"];
        const setCookie2 = Array.isArray(rawSetCookie2)
            ? rawSetCookie2
            : typeof rawSetCookie2 === "string"
                ? [rawSetCookie2]
                : undefined;
        const refresh2 = cookieValue(setCookie2, "refresh_token");
        const csrf2 = cookieValue(setCookie2, "csrf_token");
        expect(refresh2).toBeTruthy();
        expect(csrf2).toBeTruthy();
    });
});
