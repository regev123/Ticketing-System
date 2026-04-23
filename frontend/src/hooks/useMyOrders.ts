import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { queryKeys } from '@/config/queryKeys';

type UseMyOrdersParams = {
  page: number;
  size: number;
};

export function useMyOrders({ page, size }: UseMyOrdersParams) {
  return useQuery({
    queryKey: queryKeys.myOrders(page, size),
    queryFn: () => ordersApi.getMyOrders({ page, size }),
  });
}
