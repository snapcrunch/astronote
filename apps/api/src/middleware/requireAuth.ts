import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '@repo/types';
import { getApiKeyById } from '@repo/repository';

const JWT_SECRET = process.env.JWT_SECRET ?? 'astronote-dev-secret';

interface TokenPayload extends AuthUser {
  apiKeyId?: string;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as TokenPayload;

    if (payload.apiKeyId) {
      const exists = await getApiKeyById(payload.apiKeyId, payload.id);
      if (!exists) {
        res.status(401).json({ error: 'API key has been revoked' });
        return;
      }
    }

    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
