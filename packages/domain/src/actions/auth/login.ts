import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import repository from '@repo/repository';
import { getJwtSecret } from '../../config';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export async function login(
  email: string,
  password: string
): Promise<{ token: string; refreshToken: string }> {
  const user = await repository.users.getByEmail(email);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new InvalidCredentialsError();
  }

  const token = jwt.sign({ id: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: '1h',
  });

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  await repository.refreshTokens.create({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  return { token, refreshToken };
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}
