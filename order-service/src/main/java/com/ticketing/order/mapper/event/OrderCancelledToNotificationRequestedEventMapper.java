package com.ticketing.order.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.notification.NotificationRequestedEvent;
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

    private static final String TYPE_ORDER_CANCELLED = "ORDER_CANCELLED";
    private static final String SUBJECT_CANCELLED = "Order Cancelled";
    private static final String BODY_CANCELLED = "Your order %s has been cancelled. Reason: %s";

    private final UserEmailResolver userEmailResolver;

    @Override
    public NotificationRequestedEvent toEvent(OrderCancelledEventSource source) {
        var order = source.getOrder();
        var event = new NotificationRequestedEvent();
        event.setOrderId(order.getId());
        event.setUserId(order.getUserId());
        event.setEmail(userEmailResolver.resolveEmail(order.getUserId()));
        event.setType(TYPE_ORDER_CANCELLED);
        event.setSubject(SUBJECT_CANCELLED);
        event.setBody(BODY_CANCELLED.formatted(order.getId(), source.getReason()));
        return event;
    }
}
