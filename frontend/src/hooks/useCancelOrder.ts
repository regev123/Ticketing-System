import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { queryKeys } from '@/config/queryKeys';

type CancelOrderArgs = {
  orderId: string;
};

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId }: CancelOrderArgs) => ordersApi.cancelOrder(orderId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myOrder(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.availabilityAll });
    },
  });
}
