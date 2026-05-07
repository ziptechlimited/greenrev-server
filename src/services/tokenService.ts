import { RefreshToken } from "../models/RefreshToken";
import { env } from "../config/env";
import { randomToken, sha256Base64Url } from "../utils/crypto";
import { ApiError } from "../utils/errors";

export type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
};

export function refreshExpiresAt(): Date {
  const ms = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

export async function createRefreshTokenRecord(userId: string): Promise<{ refreshToken: string; csrfToken: string }> {
  const refreshToken = randomToken(48);
  const csrfToken = randomToken(24);

  await RefreshToken.create({
    userId,
    tokenHash: sha256Base64Url(refreshToken),
    csrfHash: sha256Base64Url(csrfToken),
    expiresAt: refreshExpiresAt(),
  });

  return { refreshToken, csrfToken };
}

export async function getValidRefreshTokenRecord(refreshToken: string) {
  const tokenHash = sha256Base64Url(refreshToken);
  const record = await RefreshToken.findOne({ tokenHash });
  if (!record) return null;
  if (record.revokedAt) return null;
  if (record.expiresAt.getTime() <= Date.now()) return null;
  return record;
}

export async function rotateRefreshToken(oldRefreshToken: string): Promise<{ refreshToken: string; csrfToken: string; userId: string }> {
  const record = await getValidRefreshTokenRecord(oldRefreshToken);
  if (!record) {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  }

  const userId = String(record.userId);
  const { refreshToken, csrfToken } = await createRefreshTokenRecord(userId);

  record.revokedAt = new Date();
  record.replacedByTokenHash = sha256Base64Url(refreshToken);
  await record.save();

  return { refreshToken, csrfToken, userId };
}
