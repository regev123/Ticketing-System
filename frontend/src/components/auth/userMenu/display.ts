import type { AuthMeResponse } from '@/types/api';

export function getDisplayInitials(user: AuthMeResponse): string {
  const first = user.firstName?.trim().charAt(0) ?? '';
  const last = user.lastName?.trim().charAt(0) ?? '';
  if (first && last) return `${first}${last}`.toUpperCase();
  if (first) return first.toUpperCase();
  const fromEmail = user.email?.trim().charAt(0) ?? '';
  return fromEmail ? fromEmail.toUpperCase() : '?';
}

export function getDisplayName(user: AuthMeResponse): string | null {
  const first = user.firstName?.trim() ?? '';
  const last = user.lastName?.trim() ?? '';
  const full = `${first} ${last}`.trim();
  return full.length > 0 ? full : null;
}
