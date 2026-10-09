import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../auth/token.js';
import { config } from '../config.js';
import type { User } from '../data/schemas.js';
import { findUserById } from '../services/authService.js';
import { HttpError } from '../utils/httpError.js';

export interface AuthContext {
  user: User;
}

export function getAuth(res: Response): AuthContext {
  const auth = res.locals.auth as AuthContext | undefined;
  if (!auth) throw new HttpError(401, 'UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
  return auth;
}

/** Requires `Authorization: Bearer <token>`. Distinguishes missing, invalid and expired sessions. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
  }

  const check = verifyToken(token, { secret: config.authSecret });
  // Explicit comparison: narrows the union even when strictNullChecks is off
  // (the Vercel Node.js builder type-checks with its own, looser options).
  if (check.ok === false) {
    throw check.reason === 'EXPIRED'
      ? new HttpError(401, 'SESSION_EXPIRED', 'Tu sesión expiró. Inicia sesión nuevamente.')
      : new HttpError(401, 'INVALID_TOKEN', 'La sesión no es válida. Inicia sesión nuevamente.');
  }

  const user = findUserById(check.payload.sub);
  if (!user) throw new HttpError(401, 'INVALID_TOKEN', 'La sesión no es válida. Inicia sesión nuevamente.');
  if (user.status === 'LOCKED') throw new HttpError(403, 'ACCOUNT_LOCKED', 'La cuenta está bloqueada. Contacta al administrador.');

  res.locals.auth = { user } satisfies AuthContext;
  next();
}

export function requireRole(role: User['role']) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (getAuth(res).user.role !== role) {
      throw new HttpError(403, 'FORBIDDEN', 'No tienes permisos para acceder a este recurso.');
    }
    next();
  };
}
