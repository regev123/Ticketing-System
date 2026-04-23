package com.ticketing.order.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.notification.NotificationRequestedEvent;
import com.ticketing.events.notification.NotificationType;
import com.ticketing.order.client.UserEmailResolver;
import com.ticketing.order.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Maps Order to NotificationRequestedEvent for ORDER_CONFIRMED.
 */
@Component
@RequiredArgsConstructor
public class OrderToNotificationRequestedEventMapper implements ToEventMapper<Order, NotificationRequestedEvent> {

    private static final String SUBJECT_CONFIRMED = "Order Confirmed";
    private static final String BODY_CONFIRMED = """
            Your order is confirmed.

            Order reference: %s

            Your tickets are attached to this email.
            Enjoy the event!
            """;

    private final UserEmailResolver userEmailResolver;

    @Override
    public NotificationRequestedEvent toEvent(Order source) {
        var event = new NotificationRequestedEvent();
        event.setOrderId(source.getId());
        event.setUserId(source.getUserId());
        event.setEmail(resolveNotificationEmail(source.getUserEmail(), source.getUserId()));
        event.setNotificationType(NotificationType.ORDER_CONFIRMED);
        event.setSubject(SUBJECT_CONFIRMED);
        event.setBody(BODY_CONFIRMED.formatted(toOrderReference(source.getId())));
        event.setSeatIds(source.getSeatIds());
        event.setShowTitle(source.getShowTitle());
        event.setVenueName(source.getVenueName());
        event.setStartTime(source.getStartTime());
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
