import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/User";
import type { CustomReq, UserRole, VerificationLevel } from "../types/auth";

function extractAccessToken(req: Request): string | undefined {
  const cookieToken =
    (req.cookies?.access_token as string | undefined) ?? undefined;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (!authHeader) return undefined;
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;
  return token;
}

export async function requireAuth(
  req: CustomReq,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractAccessToken(req);
    if (!token) {
      next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) {
      next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
      return;
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role as UserRole,
      name: user.name ?? null,
      isEmailVerified: Boolean(user.isEmailVerified),
      isPhoneVerified: Boolean(user.isPhoneVerified),
      verificationLevel: (user.verificationLevel as any) || "basic",
      verificationStatus: (user.verificationStatus as any) || "unverified",
    };

    next();
  } catch {
    next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: CustomReq, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
      return;
    }
    if (!roles.includes(role)) {
      next(new ApiError(403, "FORBIDDEN", "Insufficient permissions"));
      return;
    }
    next();
  };
}

export function requireVerificationLevel(levels: VerificationLevel[]) {
  return (req: CustomReq, _res: Response, next: NextFunction) => {
    const level = req.user?.verificationLevel;
    if (!level) {
      next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
      return;
    }
    if (!levels.includes(level)) {
      next(new ApiError(403, "FORBIDDEN", "Insufficient verification level"));
      return;
    }
    next();
  };
}

