package com.ticketing.auth.event;

import com.ticketing.events.notification.NotificationRequestedEvent;

public interface NotificationEventPublisher {
    void publish(NotificationRequestedEvent event);
}
