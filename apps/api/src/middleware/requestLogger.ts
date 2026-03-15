import type { Request, Response, NextFunction } from 'express';
import { logger } from '@repo/logger';

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  logger.info(
    { method: req.method, url: req.url, ip: req.ip },
    'incoming request'
  );
  next();
}
