import crypto from "crypto";

export function randomToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256Base64Url(value: string): string {
  return crypto.createHash("sha256").update(value).digest("base64url");
}

export function hmacSha256Base64Url(secret: string, value: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

