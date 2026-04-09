package com.ticketing.payment.event;

import com.ticketing.events.payment.PaymentFailedEvent;
import com.ticketing.events.payment.PaymentSucceededEvent;

/**
 * Publishes payment result events to Kafka.
 * DIP: handler depends on abstraction.
 */
public interface PaymentEventPublisher {

    void publishSucceeded(PaymentSucceededEvent event);

    void publishFailed(PaymentFailedEvent event);
}
