package com.ticketing.order.mapper.event;

import com.ticketing.order.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Context for building OrderCancelledEvent (Order + reason).
 */
@Getter
@AllArgsConstructor
public class OrderCancelledEventSource {
    private final Order order;
    private final String reason;
}
