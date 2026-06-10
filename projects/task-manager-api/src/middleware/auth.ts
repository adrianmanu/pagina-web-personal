import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './errorHandler';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new ApiError(401, 'Token de autenticación requerido'));
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as { sub?: string };
    if (!payload.sub) throw new Error('missing sub');
    req.userId = payload.sub;
    next();
  } catch {
    next(new ApiError(401, 'Token inválido o expirado'));
  }
}
