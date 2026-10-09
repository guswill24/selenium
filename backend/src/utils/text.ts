/** Lowercase and strip accents so "biblioteca" matches "Biblioteca Pública" and "publica". */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
