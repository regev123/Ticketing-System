/**
 * Shared formatting helpers. Single responsibility: present data for display.
 * Used by pages only; no API or domain logic.
 */

/** Fixed locale so dates/prices read in English regardless of browser/OS language. */
const DISPLAY_LOCALE = 'en-US';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(DISPLAY_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
}

export function toISOLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}
