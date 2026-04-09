/**
 * Hook: seat availability for a show. Single responsibility.
 */

import { useQuery } from '@tanstack/react-query';
import { availabilityApi } from '@/api/availability';
import { queryKeys } from '@/config/queryKeys';

export function useAvailability(showId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.availability(showId),
    queryFn: () => availabilityApi.getByShowId(showId!),
    enabled: Boolean(showId),
    /** Holds/orders change often; do not inherit long global staleTime for seat map accuracy. */
    staleTime: 0,
  });
}
