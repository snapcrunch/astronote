import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

interface BasicAuthConfig {
  username: string;
  passwordHash: string;
}

function getAuthConfig(): BasicAuthConfig | null {
  const method = process.env.ASTRONOTE_AUTH_METHOD;
  if (method !== 'BASIC_AUTH') {
    return null;
  }

  const credentials = process.env.ASTRONOTE_AUTH_CREDENTIALS;
  if (!credentials) {
    throw new Error(
      'ASTRONOTE_AUTH_METHOD is set to BASIC_AUTH but ASTRONOTE_AUTH_CREDENTIALS is not configured. ' +
        'Set ASTRONOTE_AUTH_CREDENTIALS to a colon-delimited string of username:password_hash ' +
        '(where password_hash is a bcrypt hash generated with htpasswd -nbB).'
    );
  }

  const colonIndex = credentials.indexOf(':');
  if (colonIndex === -1) {
    throw new Error(
      'ASTRONOTE_AUTH_CREDENTIALS must be a colon-delimited string of username:password_hash.'
    );
  }

  const username = credentials.slice(0, colonIndex);
  const passwordHash = credentials.slice(colonIndex + 1);

  if (!username || !passwordHash) {
    throw new Error(
      'ASTRONOTE_AUTH_CREDENTIALS must contain a non-empty username and password hash.'
    );
  }

  return { username, passwordHash };
}

let authConfig: BasicAuthConfig | null | undefined;

function resolveAuthConfig(): BasicAuthConfig | null {
  if (authConfig === undefined) {
    authConfig = getAuthConfig();
  }
  return authConfig;
}

export function basicAuth(req: Request, res: Response, next: NextFunction) {
  const config = resolveAuthConfig();

  if (!config) {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Astronote"');
    res.status(401).send('Authentication required');
    return;
  }

  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8');
  const [username, ...rest] = decoded.split(':');
  const password = rest.join(':');

  if (
    username === config.username &&
    bcrypt.compareSync(password, config.passwordHash)
  ) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Astronote"');
    res.status(401).send('Invalid credentials');
  }
}
