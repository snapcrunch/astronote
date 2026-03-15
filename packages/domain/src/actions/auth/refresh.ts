import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import {
  getRefreshToken,
  deleteRefreshToken,
  createRefreshToken,
  getUserById,
} from '@repo/repository';
import { getJwtSecret } from '../../config';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export async function refreshAccessToken(
  token: string
): Promise<{ token: string; refreshToken: string }> {
  const row = await getRefreshToken(token);
  if (!row) {
    throw new InvalidRefreshTokenError();
  }

  if (new Date(row.expires_at) < new Date()) {
    await deleteRefreshToken(token);
    throw new InvalidRefreshTokenError();
  }

  const user = await getUserById(row.user_id);
  if (!user) {
    await deleteRefreshToken(token);
    throw new InvalidRefreshTokenError();
  }

  // Rotate: delete old, create new
  await deleteRefreshToken(token);
  const newRefreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  await createRefreshToken(user.id, newRefreshToken, expiresAt);

  const accessToken = jwt.sign({ id: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: '1h',
  });

  return { token: accessToken, refreshToken: newRefreshToken };
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid or expired refresh token');
    this.name = 'InvalidRefreshTokenError';
  }
}
