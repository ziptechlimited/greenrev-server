import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/apiResponse";
import { ApiError } from "../utils/errors";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, { code: "NOT_FOUND", message: `Not Found - ${req.originalUrl}` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    sendError(res, err.status, { code: err.code, message: err.message, details: err.details });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";
  sendError(res, 500, { code: "INTERNAL_ERROR", message });
}
