/**
 * Orders API. Single responsibility: order HTTP only.
 */

import { client } from '@/api/client';
import type {
  AdminMetricsResponse,
  CreateOrderRequest,
  OrderResponse,
  PagedResponse,
  ScanTicketRequest,
  ScanTicketResponse,
} from '@/types/api';

const ORDERS = '/api/orders';

type MyOrdersQuery = {
  page?: number;
  size?: number;
};

export const ordersApi = {
  create: (body: CreateOrderRequest) =>
    client.post<OrderResponse>(ORDERS, { ...body, seatIds: [...body.seatIds] }),
  getMyOrders: (query: MyOrdersQuery = {}) =>
    client.get<PagedResponse<OrderResponse>>(`${ORDERS}/me`, {
      params: {
        page: String(query.page ?? 0),
        size: String(query.size ?? 12),
      },
    }),
  getMyOrder: (orderId: string) =>
    client.get<OrderResponse>(`${ORDERS}/me/${orderId}`),
  cancelSeats: (orderId: string, seatIds: string[]) =>
    client.post<OrderResponse>(`${ORDERS}/me/${orderId}/cancel-seats`, { seatIds }),
  cancelOrder: (orderId: string) =>
    client.post<OrderResponse>(`${ORDERS}/me/${orderId}/cancel`),
  scanTicket: (body: ScanTicketRequest) =>
    client.post<ScanTicketResponse>(`${ORDERS}/check-in/scan`, body),
  getAdminMetrics: (days = 30) =>
    client.get<AdminMetricsResponse>(`${ORDERS}/admin/metrics`, { params: { days: String(days) } }),
  downloadTicket: (orderId: string, seatId: string) =>
    client.getBlob(`${ORDERS}/me/${orderId}/tickets/${seatId}.pdf`),
};
