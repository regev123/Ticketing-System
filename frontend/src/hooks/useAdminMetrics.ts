import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { queryKeys } from '@/config/queryKeys';

export function useAdminMetrics(days = 30) {
  return useQuery({
    queryKey: queryKeys.adminMetrics(days),
    queryFn: () => ordersApi.getAdminMetrics(days),
  });
}
