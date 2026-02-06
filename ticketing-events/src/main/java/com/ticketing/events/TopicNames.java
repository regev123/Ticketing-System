package com.ticketing.events;

/**
 * Kafka topic names for event-driven communication.
 * Single source of truth for producers and consumers.
 */
public final class TopicNames {

    public static final String RESERVATION_EVENTS = "reservation.events";
    public static final String PAYMENT_EVENTS = "payment.events";
    public static final String ORDER_EVENTS = "order.events";
    public static final String NOTIFICATION_EVENTS = "notification.events";

    private TopicNames() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
