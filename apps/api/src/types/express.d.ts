import type { AuthUser } from '@repo/types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
