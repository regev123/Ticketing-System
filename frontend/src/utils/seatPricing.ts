import type { SeatInfo } from '@/types/api';

/**
 * Lowest list price among the given seats (e.g. availability API — already excludes sold/held).
 */
export function lowestPricedSeat(seats: SeatInfo[] | undefined | null): { price: number; currency: string } | null {
  if (!seats?.length) return null;
  const min = seats.reduce((best, s) => (s.price < best.price ? s : best));
  return { price: min.price, currency: min.currency };
}
