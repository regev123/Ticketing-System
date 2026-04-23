package com.ticketing.order.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.notification.NotificationRequestedEvent;
import com.ticketing.events.notification.NotificationType;
import com.ticketing.order.client.UserEmailResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Maps OrderCancelledEventSource to NotificationRequestedEvent for ORDER_CANCELLED.
 */
@Component
@RequiredArgsConstructor
public class OrderCancelledToNotificationRequestedEventMapper
        implements ToEventMapper<OrderCancelledEventSource, NotificationRequestedEvent> {

    private static final String SUBJECT_CANCELLED = "Order Cancelled";
    private static final String BODY_CANCELLED = """
            Your order has been cancelled.

            Order reference: %s
            Reason: %s
            """;

    private final UserEmailResolver userEmailResolver;

    @Override
    public NotificationRequestedEvent toEvent(OrderCancelledEventSource source) {
        var order = source.getOrder();
        var event = new NotificationRequestedEvent();
        event.setOrderId(order.getId());
        event.setUserId(order.getUserId());
        event.setEmail(resolveNotificationEmail(order.getUserEmail(), order.getUserId()));
        event.setNotificationType(NotificationType.ORDER_CANCELLED);
        event.setSubject(SUBJECT_CANCELLED);
        event.setBody(BODY_CANCELLED.formatted(toOrderReference(order.getId()), source.getReason()));
        event.setShowTitle(order.getShowTitle());
        event.setVenueName(order.getVenueName());
        event.setStartTime(order.getStartTime());
        return event;
    }

    private String resolveNotificationEmail(String orderEmail, String userId) {
        if (orderEmail != null && !orderEmail.isBlank()) {
            return orderEmail;
        }
        return userEmailResolver.resolveEmail(userId);
    }

    private static String toOrderReference(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            return "N/A";
        }
        String compact = orderId.replace("-", "");
        int length = Math.min(8, compact.length());
        return "#" + compact.substring(0, length).toUpperCase();
    }
}
