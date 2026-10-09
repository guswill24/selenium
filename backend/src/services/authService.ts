import { z } from 'zod';
import { createToken } from '../auth/token.js';
import { config } from '../config.js';
import { data } from '../scenario/context.js';
import type { User } from '../data/schemas.js';
import { HttpError } from '../utils/httpError.js';

export type PublicUser = Omit<User, 'password'>;

export const loginSchema = z.object({
  username: z.string({ error: 'El usuario es obligatorio.' }).trim().min(1, 'El usuario es obligatorio.'),
  password: z.string({ error: 'La contraseña es obligatoria.' }).min(1, 'La contraseña es obligatoria.'),
});

export const profileUpdateSchema = z.object({
  fullName: z
    .string({ error: 'El nombre es obligatorio.' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(80, 'El nombre no puede superar 80 caracteres.'),
  email: z.string({ error: 'El correo es obligatorio.' }).trim().pipe(z.email('El correo no tiene un formato válido.')),
  phone: z
    .string({ error: 'El teléfono es obligatorio.' })
    .trim()
    .regex(/^[0-9 +()-]{7,20}$/, 'El teléfono debe tener entre 7 y 20 dígitos.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export interface LoginResult {
  token: string;
  expiresAt: string;
  user: PublicUser;
}

export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function findUserById(id: string): User | undefined {
  return data().users.find((user) => user.id === id);
}

/**
 * Educational note: distinct messages for unknown user and wrong password are
 * required by the lab (F02). Real systems should use one generic message to
 * avoid user enumeration; students may report this as a security finding.
 */
export function login({ username, password }: LoginInput, now = Date.now()): LoginResult {
  const user = data().users.find((candidate) => candidate.username === username.toLowerCase());
  if (!user) throw new HttpError(401, 'USER_NOT_FOUND', 'El usuario no existe.');
  if (user.password !== password) throw new HttpError(401, 'WRONG_PASSWORD', 'La contraseña es incorrecta.');
  if (user.status === 'LOCKED') throw new HttpError(403, 'ACCOUNT_LOCKED', 'La cuenta está bloqueada. Contacta al administrador.');

  const token = createToken({ sub: user.id, role: user.role }, { secret: config.authSecret, ttlMinutes: config.sessionTtlMinutes, now });
  const expiresAt = new Date(now + config.sessionTtlMinutes * 60_000).toISOString();
  return { token, expiresAt, user: toPublicUser(user) };
}

/** Validates a profile change. Fixtures are read-only, so the result is returned but not persisted. */
export function previewProfileUpdate(user: User, update: ProfileUpdate): PublicUser {
  return { ...toPublicUser(user), ...update };
}
