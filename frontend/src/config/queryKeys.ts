/**
 * Single source of truth for TanStack Query keys (DRY, stable invalidation).
 */

export const queryKeys = {
  shows: ['shows'] as const,
  show: (id: string | undefined) => ['show', id] as const,
  /** Prefix: invalidates every availability query for any show */
  availabilityAll: ['availability'] as const,
  availability: (showId: string | undefined) => ['availability', showId] as const,
  /** Current user's active hold for a show (reservation-service). */
  myActiveHold: (showId: string | undefined) => ['reservations', 'myHold', showId] as const,
  ordersAll: ['orders'] as const,
  adminMetrics: (days: number) => ['orders', 'admin', 'metrics', days] as const,
  myOrders: (page: number, size: number) => ['orders', 'my', page, size] as const,
  myOrder: (orderId: string | undefined) => ['orders', 'my', orderId] as const,
} as const;
