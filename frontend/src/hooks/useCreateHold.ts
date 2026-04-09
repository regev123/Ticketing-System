/**
 * Hook: create hold mutation. Single responsibility.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/api/reservations';
import { queryKeys } from '@/config/queryKeys';
import type { CreateHoldRequest } from '@/types/api';

export function useCreateHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHoldRequest) => reservationsApi.createHold(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availabilityAll });
    },
  });
}
