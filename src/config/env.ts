import { ApiError } from "../utils/errors";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ApiError(500, "CONFIG_MISSING", `${name} is not set`);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name];
}

function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  nodeEnv: optional("NODE_ENV") ?? "development",
  port: toInt(optional("PORT"), 4000),
  mongoUri: required("MONGO_URI"),
  frontendUrls: required("FRONTEND_URL"),
  accessTokenSecret: required("JWT_ACCESS_SECRET"),
  accessTokenTtlSeconds: toInt(optional("JWT_ACCESS_TTL_SECONDS"), 900),
  refreshTokenTtlDays: toInt(optional("REFRESH_TOKEN_TTL_DAYS"), 7),
  bcryptSaltRounds: toInt(optional("BCRYPT_SALT_ROUNDS"), 12),
  cookieDomain: optional("COOKIE_DOMAIN"),
  cookieSameSite: (optional("COOKIE_SAMESITE") ?? "lax") as
    | "lax"
    | "strict"
    | "none",
  oauthStateSecret: required("OAUTH_STATE_SECRET"),
  googleClientId: optional("GOOGLE_CLIENT_ID"),
  googleClientSecret: optional("GOOGLE_CLIENT_SECRET"),
  googleRedirectUri: optional("GOOGLE_REDIRECT_URI"),
  smtpHost: optional("SMTP_HOST"),
  smtpPort: toInt(optional("SMTP_PORT"), 465),
  smtpUser: optional("SMTP_USER"),
  smtpPass: optional("SMTP_PASS"),
  smtpFrom: optional("SMTP_FROM"),
};
