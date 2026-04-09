/**
 * Single source of truth for TanStack Query keys (DRY, stable invalidation).
 */

export const queryKeys = {
  shows: ['shows'] as const,
  show: (id: string | undefined) => ['show', id] as const,
  /** Prefix: invalidates every availability query for any show */
  availabilityAll: ['availability'] as const,
  availability: (showId: string | undefined) => ['availability', showId] as const,
} as const;
