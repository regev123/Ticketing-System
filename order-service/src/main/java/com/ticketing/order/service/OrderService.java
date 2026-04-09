package com.ticketing.order.service;

import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;

import java.util.Set;

/**
 * Service interface for order operations.
 * DIP: controller depends on abstraction.
 */
public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    /**
     * Seat IDs tied to active orders (payment pending or confirmed) for this show.
     */
    Set<String> getUnavailableSeatIdsForShow(String showId);
}
