package com.ticketing.order.event;

import com.ticketing.events.payment.PaymentRequestedEvent;

/**
 * Publishes payment domain events to Kafka.
 * DIP: services depend on this interface, not the concrete implementation.
 */
public interface PaymentEventPublisher {

    void publish(PaymentRequestedEvent event);
}
