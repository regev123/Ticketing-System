package com.ticketing.order.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.notification.NotificationRequestedEvent;
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

    private static final String TYPE_ORDER_CONFIRMED = "ORDER_CONFIRMED";
    private static final String SUBJECT_CONFIRMED = "Order Confirmed";
    private static final String BODY_CONFIRMED = "Your order %s has been confirmed.";

    private final UserEmailResolver userEmailResolver;

    @Override
    public NotificationRequestedEvent toEvent(Order source) {
        var event = new NotificationRequestedEvent();
        event.setOrderId(source.getId());
        event.setUserId(source.getUserId());
        event.setEmail(userEmailResolver.resolveEmail(source.getUserId()));
        event.setType(TYPE_ORDER_CONFIRMED);
        event.setSubject(SUBJECT_CONFIRMED);
        event.setBody(BODY_CONFIRMED.formatted(source.getId()));
        return event;
    }
}
