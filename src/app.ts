import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes";
import rbacRoutes from "./routes/rbacRoutes";
import productRoutes from "./routes/productRoutes";
import profileRoutes from "./routes/profileRoutes";
import acquisitionRoutes from "./routes/acquisitionRoutes";
import adminAcquisitionRoutes from "./routes/adminAcquisitionRoutes";
import adminDashboardRoutes from "./routes/adminDashboardRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { env } from "./config/env";
import { sanitizeRequest } from "./middleware/sanitize";
import { requireHttps } from "./middleware/requireHttps";
import { requireCsrf } from "./middleware/csrf";
import expertRoutes from "./routes/expertRoutes";
import mechanicRoutes from "./routes/mechanicRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { verificationRoutes } from "./routes/verificationRoutes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(requireHttps);
  app.use(helmet());

  app.use(
    cors({
      origin: env.frontendUrls,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    }),
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(sanitizeRequest);
  app.use(requireCsrf);

  app.use("/api/v1", healthRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1", rbacRoutes);
  app.use("/api/v1", productRoutes);
  app.use("/api/v1", profileRoutes);
  app.use("/api/v1", acquisitionRoutes);
  app.use("/api/v1", adminAcquisitionRoutes);
  app.use("/api/v1/admin", adminDashboardRoutes);
  app.use("/api/v1", expertRoutes);
  app.use("/api/v1", mechanicRoutes);
  app.use("/api/v1", bookingRoutes);
  app.use("/api/v1", uploadRoutes);
  app.use("/api/v1/verification", verificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
