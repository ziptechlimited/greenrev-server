import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes";
import rbacRoutes from "./routes/rbacRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { env } from "./config/env";
import { sanitizeRequest } from "./middleware/sanitize";
import { requireHttps } from "./middleware/requireHttps";
import { requireCsrf } from "./middleware/csrf";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(requireHttps);
  app.use(helmet());

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    }),
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(sanitizeRequest);
  app.use(requireCsrf);

  app.use("/api/v1", healthRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1", rbacRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
