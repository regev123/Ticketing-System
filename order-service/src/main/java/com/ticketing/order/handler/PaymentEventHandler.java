package com.ticketing.order.handler;

import com.ticketing.events.payment.PaymentFailedEvent;
import com.ticketing.events.payment.PaymentSucceededEvent;
import com.ticketing.order.entity.Order;
import com.ticketing.order.entity.OrderStatus;
import com.ticketing.order.event.NotificationEventPublisher;
import com.ticketing.order.event.OrderEventPublisher;
import com.ticketing.order.mapper.event.OrderCancelledEventSource;
import com.ticketing.order.mapper.event.OrderCancelledToNotificationRequestedEventMapper;
import com.ticketing.order.mapper.event.OrderToNotificationRequestedEventMapper;
import com.ticketing.order.mapper.event.OrderToOrderCancelledEventMapper;
import com.ticketing.order.mapper.event.OrderToOrderConfirmedEventMapper;
import com.ticketing.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Handles payment domain events (succeeded/failed).
 * Single responsibility: update order status and publish order events.
 */
@Component
@RequiredArgsConstructor
public class PaymentEventHandler {
    private final OrderRepository orderRepository;
    private final OrderToOrderConfirmedEventMapper orderConfirmedEventMapper;
    private final OrderToOrderCancelledEventMapper orderCancelledEventMapper;
    private final OrderToNotificationRequestedEventMapper orderConfirmedNotificationMapper;
    private final OrderCancelledToNotificationRequestedEventMapper orderCancelledNotificationMapper;
    private final OrderEventPublisher orderEventPublisher;
    private final NotificationEventPublisher notificationEventPublisher;

    public void handlePaymentSucceeded(PaymentSucceededEvent event) {
        Order order = requireOrder(event.getOrderId());
        if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            return;
        }
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        orderEventPublisher.publishOrderConfirmed(orderConfirmedEventMapper.toEvent(order));
        notificationEventPublisher.publish(orderConfirmedNotificationMapper.toEvent(order));
    }

    public void handlePaymentFailed(PaymentFailedEvent event) {
        Order order = requireOrder(event.getOrderId());
        if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            return;
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        String reason = event.getReason() != null ? event.getReason() : "Payment failed";
        var source = new OrderCancelledEventSource(order, reason);
        orderEventPublisher.publishOrderCancelled(orderCancelledEventMapper.toEvent(source));
        notificationEventPublisher.publish(orderCancelledNotificationMapper.toEvent(source));
    }

    private Order requireOrder(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("Order not found yet for payment event: " + orderId));
    }
}
