package com.ticketing.order.event;

import com.ticketing.events.notification.NotificationRequestedEvent;

/**
 * Publishes notification events to Kafka.
 * DIP: handler depends on abstraction.
 */
public interface NotificationEventPublisher {

    void publish(NotificationRequestedEvent event);
}
