import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/errors";

export function requireCsrf(req: Request, _res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    next();
    return;
  }

  const hasSession = Boolean(req.cookies?.refresh_token);
  if (!hasSession) {
    next();
    return;
  }

  const csrfCookie = req.cookies?.csrf_token as string | undefined;
  const csrfHeader = (req.headers["x-csrf-token"] as string | undefined) ?? "";

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    next(new ApiError(403, "CSRF_INVALID", "CSRF token invalid"));
    return;
  }

  next();
}

