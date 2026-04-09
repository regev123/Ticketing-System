package com.ticketing.notification.handler;

import com.ticketing.events.notification.NotificationRequestedEvent;
import org.springframework.stereotype.Component;

/**
 * Handles notification.requested: mock send.
 * SRP: process notification request.
 */
@Component
public class NotificationHandler {

    public void handle(NotificationRequestedEvent event) {
        // Mock: in production, integrate with email/SMS provider
    }
}
