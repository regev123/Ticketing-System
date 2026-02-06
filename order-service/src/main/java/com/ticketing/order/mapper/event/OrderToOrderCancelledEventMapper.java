package com.ticketing.order.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.order.OrderCancelledEvent;
import org.springframework.stereotype.Component;

/**
 * Maps OrderCancelledEventSource to OrderCancelledEvent.
 */
@Component
public class OrderToOrderCancelledEventMapper implements ToEventMapper<OrderCancelledEventSource, OrderCancelledEvent> {

    @Override
    public OrderCancelledEvent toEvent(OrderCancelledEventSource source) {
        var order = source.getOrder();
        var event = new OrderCancelledEvent();
        event.setOrderId(order.getId());
        event.setHoldId(order.getHoldId());
        event.setShowId(order.getShowId());
        event.setSeatIds(order.getSeatIds());
        event.setReason(source.getReason());
        return event;
    }
}
