/**
 * Orders API. Single responsibility: order HTTP only.
 */

import { client } from '@/api/client';
import type { CreateOrderRequest, OrderResponse } from '@/types/api';

const ORDERS = '/api/orders';

export const ordersApi = {
  create: (body: CreateOrderRequest) =>
    client.post<OrderResponse>(ORDERS, { ...body, seatIds: [...body.seatIds] }),
};
