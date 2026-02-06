package com.ticketing.order.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.order.OrderConfirmedEvent;
import com.ticketing.order.entity.Order;
import org.springframework.stereotype.Component;

/**
 * Maps Order to OrderConfirmedEvent.
 */
@Component
public class OrderToOrderConfirmedEventMapper implements ToEventMapper<Order, OrderConfirmedEvent> {

    @Override
    public OrderConfirmedEvent toEvent(Order source) {
        var event = new OrderConfirmedEvent();
        event.setOrderId(source.getId());
        event.setHoldId(source.getHoldId());
        event.setShowId(source.getShowId());
        event.setSeatIds(source.getSeatIds());
        event.setUserId(source.getUserId());
        return event;
    }
}
