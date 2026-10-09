/**
 * Test ids of shared states (loading, errors) can appear in several sections of one page.
 * The main section keeps the plain id from the specification (`loading-indicator`,
 * `server-error`…); secondary sections are prefixed (`all-routes-server-error`) so every
 * selector matches exactly one element.
 */
export function scopedTestId(scope: string | undefined, testId: string): string {
  return scope ? `${scope}-${testId}` : testId;
}

/** "Inicio" → "inicio", "Gestión de rutas" → "gestion-de-rutas". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
