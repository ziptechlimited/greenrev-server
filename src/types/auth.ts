import { Request } from "express";

export type UserRole = "customer" | "vendor" | "mechanic" | "admin";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  isEmailVerified: boolean;
};

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
};

export interface CustomReq extends Request {
  user?: AuthenticatedUser;
}
