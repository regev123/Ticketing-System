import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { queryKeys } from '@/config/queryKeys';

type CancelOrderSeatsArgs = {
  orderId: string;
  seatIds: string[];
  page?: number;
  size?: number;
};

export function useCancelOrderSeats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, seatIds }: CancelOrderSeatsArgs) => ordersApi.cancelSeats(orderId, seatIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myOrder(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.availabilityAll });
    },
  });
}
