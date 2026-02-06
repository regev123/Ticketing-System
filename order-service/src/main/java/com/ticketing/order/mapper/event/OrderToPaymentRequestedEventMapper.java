package com.ticketing.order.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.payment.PaymentRequestedEvent;
import com.ticketing.order.entity.Order;
import org.springframework.stereotype.Component;

/**
 * Maps Order to PaymentRequestedEvent.
 */
@Component
public class OrderToPaymentRequestedEventMapper implements ToEventMapper<Order, PaymentRequestedEvent> {

    @Override
    public PaymentRequestedEvent toEvent(Order source) {
        var event = new PaymentRequestedEvent();
        event.setPaymentId(java.util.UUID.randomUUID().toString());
        event.setOrderId(source.getId());
        event.setHoldId(source.getHoldId());
        event.setAmount(source.getAmount());
        event.setCurrency(source.getCurrency());
        event.setUserId(source.getUserId());
        return event;
    }
}
