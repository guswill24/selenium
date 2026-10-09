export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatMinutes(minutes: number): string {
  return pluralize(minutes, 'minuto', 'minutos');
}

/**
 * "2026-03-02T07:40:00-05:00" → "02/03/2026 07:40", read from the text itself.
 * Deliberately not `toLocaleString`, whose output depends on each computer's time zone.
 */
export function formatDateTime(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

/** "BUS102" → "BUS 102", as shown to passengers. */
export function busLabel(id: string): string {
  return id.replace(/^BUS/, 'BUS ');
}
