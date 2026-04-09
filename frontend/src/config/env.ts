/**
 * Single place for environment-derived config (SRP).
 * Used by API client only; no UI logic here.
 */
const apiBase = import.meta.env.VITE_API_BASE ?? '';

export const env = {
  apiBase: apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase,
} as const;
