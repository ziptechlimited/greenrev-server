import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/errors";

export function requireHttps(req: Request, _res: Response, next: NextFunction): void {
  if (env.nodeEnv !== "production") {
    next();
    return;
  }

  const proto = (req.headers["x-forwarded-proto"] as string | undefined) ?? "";
  if (proto.toLowerCase() !== "https") {
    next(new ApiError(400, "HTTPS_REQUIRED", "HTTPS is required"));
    return;
  }

  next();
}

