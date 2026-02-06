package com.ticketing.order.event;

import com.ticketing.events.order.OrderCancelledEvent;
import com.ticketing.events.order.OrderConfirmedEvent;

/**
 * Publishes order domain events to Kafka.
 * DIP: consumers depend on this interface, not the concrete implementation.
 */
public interface OrderEventPublisher {

    void publishOrderConfirmed(OrderConfirmedEvent event);

    void publishOrderCancelled(OrderCancelledEvent event);
}
