import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/errors";

type Options = {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
};

export function slidingWindowRateLimit(options: Options) {
  const hits = new Map<string, number[]>();

  const keyGenerator =
    options.keyGenerator ??
    ((req: Request) => req.ip ?? (req.headers["x-forwarded-for"] as string | undefined) ?? "unknown");

  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const windowStart = now - options.windowMs;

    const prev = hits.get(key) ?? [];
    const filtered = prev.filter((t) => t > windowStart);
    filtered.push(now);
    hits.set(key, filtered);

    if (filtered.length > options.max) {
      next(new ApiError(429, "RATE_LIMITED", "Too many requests"));
      return;
    }

    next();
  };
}
