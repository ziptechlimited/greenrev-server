import { Request } from "express";

export type UserRole = "customer" | "vendor" | "mechanic" | "admin";

export type VerificationLevel = "basic" | "individual" | "business";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  verificationLevel: VerificationLevel;
  verificationStatus: VerificationStatus;
  permissions: string[];
  sessionVersion?: number;
};

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  sessionVersion?: number;
};

export interface CustomReq extends Request {
  user?: AuthenticatedUser;
}
