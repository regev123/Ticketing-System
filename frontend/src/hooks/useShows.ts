/**
 * Hook: list all shows. Single responsibility.
 */

import { useQuery } from '@tanstack/react-query';
import { showsApi } from '@/api/shows';
import { queryKeys } from '@/config/queryKeys';

export function useShows() {
  return useQuery({
    queryKey: queryKeys.shows,
    queryFn: () => showsApi.list(),
  });
}
