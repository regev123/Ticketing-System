package com.ticketing.events.notification;

/**
 * Business notification kinds handled by notification-service.
 */
public enum NotificationType {
    ORDER_CONFIRMED,
    ORDER_CANCELLED,
    PAYMENT_FAILED,
    EMAIL_VERIFICATION
}
