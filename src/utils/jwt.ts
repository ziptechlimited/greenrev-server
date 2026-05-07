import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AccessTokenPayload } from "../types/auth";

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.accessTokenSecret, {
    expiresIn: env.accessTokenTtlSeconds,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.accessTokenSecret) as AccessTokenPayload;
}

