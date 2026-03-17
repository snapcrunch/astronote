import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { AuthUser, ApiKeyWithToken } from '@repo/types';
import repository from '@repo/repository';
import { getJwtSecret } from '../../config';

export async function create(
  user: AuthUser,
  name: string
): Promise<ApiKeyWithToken> {
  const id = crypto.randomUUID();
  const token = jwt.sign(
    { id: user.id, email: user.email, apiKeyId: id },
    getJwtSecret()
  );
  await repository.apiKeys.create(user.id, id, name, token);
  return { id, name, token };
}
