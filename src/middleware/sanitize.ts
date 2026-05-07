import type { NextFunction, Request, Response } from "express";

function sanitizeInPlace(value: unknown): void {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    for (const item of value) sanitizeInPlace(item);
    return;
  }

  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete (value as Record<string, unknown>)[key];
      continue;
    }
    sanitizeInPlace((value as Record<string, unknown>)[key]);
  }
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction): void {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.query);
  sanitizeInPlace(req.params);
  next();
}
