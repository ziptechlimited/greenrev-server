"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const rbacRoutes_1 = __importDefault(require("./routes/rbacRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const env_1 = require("./config/env");
const sanitize_1 = require("./middleware/sanitize");
const requireHttps_1 = require("./middleware/requireHttps");
const csrf_1 = require("./middleware/csrf");
function createApp() {
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    app.use(requireHttps_1.requireHttps);
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.frontendUrl,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(sanitize_1.sanitizeRequest);
    app.use(csrf_1.requireCsrf);
    app.use("/api/v1", healthRoutes_1.default);
    app.use("/api/v1/auth", authRoutes_1.default);
    app.use("/api/v1", rbacRoutes_1.default);
    app.use("/api/v1", productRoutes_1.default);
    app.use("/api/v1", profileRoutes_1.default);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
