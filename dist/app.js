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
const acquisitionRoutes_1 = __importDefault(require("./routes/acquisitionRoutes"));
const adminAcquisitionRoutes_1 = __importDefault(require("./routes/adminAcquisitionRoutes"));
const adminDashboardRoutes_1 = __importDefault(require("./routes/adminDashboardRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const cmsRoutes_1 = __importDefault(require("./routes/cmsRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const env_1 = require("./config/env");
const sanitize_1 = require("./middleware/sanitize");
const requireHttps_1 = require("./middleware/requireHttps");
const csrf_1 = require("./middleware/csrf");
const expertRoutes_1 = __importDefault(require("./routes/expertRoutes"));
const mechanicRoutes_1 = __importDefault(require("./routes/mechanicRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const verificationRoutes_1 = require("./routes/verificationRoutes");
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
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(sanitize_1.sanitizeRequest);
    app.use(csrf_1.requireCsrf);
    app.use("/api/v1", healthRoutes_1.default);
    app.use("/api/v1/auth", authRoutes_1.default);
    app.use("/api/v1", rbacRoutes_1.default);
    app.use("/api/v1", productRoutes_1.default);
    app.use("/api/v1", profileRoutes_1.default);
    app.use("/api/v1", acquisitionRoutes_1.default);
    app.use("/api/v1", adminAcquisitionRoutes_1.default);
    app.use("/api/v1/admin", adminDashboardRoutes_1.default);
    app.use("/api/v1/admin", adminRoutes_1.default);
    app.use("/api/v1", supportRoutes_1.default);
    app.use("/api/v1", cmsRoutes_1.default);
    app.use("/api/v1", settingsRoutes_1.default);
    app.use("/api/v1", expertRoutes_1.default);
    app.use("/api/v1", mechanicRoutes_1.default);
    app.use("/api/v1", bookingRoutes_1.default);
    app.use("/api/v1", uploadRoutes_1.default);
    app.use("/api/v1/verification", verificationRoutes_1.verificationRoutes);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
