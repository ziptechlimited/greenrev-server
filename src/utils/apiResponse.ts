import type { Response } from "express";

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export function sendSuccess<T>(res: Response, status: number, data: T) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, status: number, error: ApiErrorBody) {
  return res.status(status).json({ success: false, error });
}

