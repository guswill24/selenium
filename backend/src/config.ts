/**
 * Public demo secret. Mi Ruta protects fictitious data only; set AUTH_SECRET
 * in the environment to override it. Never reuse this value in a real system.
 */
const DEMO_AUTH_SECRET = 'mi-ruta-demo-secret-not-for-production';
const DEFAULT_SESSION_TTL_MINUTES = 120;

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const isDeployed = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
if (isDeployed && !process.env.AUTH_SECRET) {
  console.warn('[mi-ruta] AUTH_SECRET is not set: session tokens are signed with the public demo secret.');
}

export const config = {
  authSecret: process.env.AUTH_SECRET || DEMO_AUTH_SECRET,
  sessionTtlMinutes: positiveInteger(process.env.SESSION_TTL_MINUTES, DEFAULT_SESSION_TTL_MINUTES),
} as const;
