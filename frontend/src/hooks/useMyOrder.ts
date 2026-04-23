import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { queryKeys } from '@/config/queryKeys';

export function useMyOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.myOrder(orderId),
    queryFn: () => ordersApi.getMyOrder(orderId!),
    enabled: Boolean(orderId),
  });
}
