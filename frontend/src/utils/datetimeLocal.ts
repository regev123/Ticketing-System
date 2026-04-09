/**
 * Split / join values in the same shape as HTML datetime-local and toISOLocal (YYYY-MM-DDTHH:mm:00).
 */

/** Parse stored local datetime string into a Date (browser local timezone). */
export function parseLocalDatetimeString(value: string): Date | null {
  if (!value || value.length < 10) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format a local Date for API / state (same shape as toISOLocal). */
export function dateToLocalDatetimeString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export function splitDatetimeLocal(value: string): { date: string; time: string } {
  if (!value || value.length < 10) {
    return { date: '', time: '19:00' };
  }
  const date = value.slice(0, 10);
  const raw = value.slice(11);
  let time = '19:00';
  if (raw.length >= 5) {
    time = raw.slice(0, 5);
  }
  return { date, time };
}

export function joinDatetimeLocal(date: string, time: string): string {
  const t = time && time.length >= 5 ? time.slice(0, 5) : '12:00';
  if (!date || date.length < 10) {
    return '';
  }
  return `${date.slice(0, 10)}T${t}:00`;
}

/** Calendar date only (YYYY-MM-DD), local midnight. */
export function parseDateOnlyString(value: string): Date | null {
  if (!value || value.length < 10) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function formatDateOnlyLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Time of day HH:mm (24h), anchored on a fixed calendar day for pickers. */
export function parseTimeHmString(value: string): Date | null {
  if (!value || value.length < 4) return null;
  const parts = value.trim().split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return new Date(2000, 0, 1, h, m, 0, 0);
}

export function formatTimeHmLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
