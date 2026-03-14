import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { AuthUser, ApiKeyWithToken } from '@repo/types';
import { createApiKey as repoCreate } from '@repo/repository';

const JWT_SECRET = process.env.JWT_SECRET ?? 'astronote-dev-secret';

export async function create(
  user: AuthUser,
  name: string
): Promise<ApiKeyWithToken> {
  const id = crypto.randomUUID();
  const token = jwt.sign({ id: user.id, email: user.email, apiKeyId: id }, JWT_SECRET);
  await repoCreate(user.id, id, name, token);
  return { id, name, token };
}
