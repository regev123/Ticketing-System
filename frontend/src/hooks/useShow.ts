/**
 * Hook: single show by id. Single responsibility.
 */

import { useQuery } from '@tanstack/react-query';
import { showsApi } from '@/api/shows';
import { queryKeys } from '@/config/queryKeys';

export function useShow(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.show(id),
    queryFn: () => showsApi.getById(id!),
    enabled: Boolean(id),
  });
}
