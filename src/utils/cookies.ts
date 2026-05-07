import type { CookieOptions } from "express";
import { env } from "../config/env";

export function baseCookieOptions(): CookieOptions {
  const sameSite = env.cookieSameSite;
  const secure = env.nodeEnv === "production" || sameSite === "none";

  return {
    httpOnly: true,
    secure,
    sameSite,
    domain: env.cookieDomain,
    path: "/",
  };
}

export function csrfCookieOptions(): CookieOptions {
  const sameSite = env.cookieSameSite;
  const secure = env.nodeEnv === "production" || sameSite === "none";

  return {
    httpOnly: false,
    secure,
    sameSite,
    domain: env.cookieDomain,
    path: "/",
  };
}
