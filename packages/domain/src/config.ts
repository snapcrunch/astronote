let jwtSecret: string | undefined;

export function setJwtSecret(secret: string) {
  jwtSecret = secret;
}

export function getJwtSecret(): string {
  if (!jwtSecret) {
    throw new Error(
      'JWT secret not configured. Call domain.system.init() first.'
    );
  }
  return jwtSecret;
}
