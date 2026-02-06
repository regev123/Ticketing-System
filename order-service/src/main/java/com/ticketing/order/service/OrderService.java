package com.ticketing.order.service;

import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;

/**
 * Service interface for order operations.
 * DIP: controller depends on abstraction.
 */
public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);
}
