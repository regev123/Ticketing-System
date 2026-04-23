/**
 * Hook: create order mutation. Single responsibility.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { queryKeys } from '@/config/queryKeys';
import type { CreateOrderRequest } from '@/types/api';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderRequest) => ordersApi.create(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availabilityAll });
      // Drop cached my-hold so returning to seat map does not re-hydrate a released hold.
      queryClient.removeQueries({ queryKey: queryKeys.myActiveHold(variables.showId) });
    },
  });
}
