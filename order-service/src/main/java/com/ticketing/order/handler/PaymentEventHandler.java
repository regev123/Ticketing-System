package com.ticketing.order.handler;

import com.ticketing.events.payment.PaymentFailedEvent;
import com.ticketing.events.payment.PaymentSucceededEvent;
import com.ticketing.order.entity.Order;
import com.ticketing.order.entity.OrderStatus;
import com.ticketing.order.event.OrderEventPublisher;
import com.ticketing.order.mapper.event.OrderCancelledEventSource;
import com.ticketing.order.mapper.event.OrderToOrderCancelledEventMapper;
import com.ticketing.order.mapper.event.OrderToOrderConfirmedEventMapper;
import com.ticketing.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Handles payment domain events (succeeded/failed).
 * Single responsibility: update order status and publish order events.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventHandler {

    private final OrderRepository orderRepository;
    private final OrderToOrderConfirmedEventMapper orderConfirmedEventMapper;
    private final OrderToOrderCancelledEventMapper orderCancelledEventMapper;
    private final OrderEventPublisher orderEventPublisher;

    public void handlePaymentSucceeded(PaymentSucceededEvent event) {
        Optional<Order> opt = orderRepository.findById(event.getOrderId());
        if (opt.isEmpty()) {
            log.warn("Order not found for payment.succeeded: orderId={}", event.getOrderId());
            return;
        }
        Order order = opt.get();
        if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            log.info("Order already processed: orderId={}, status={}", order.getId(), order.getStatus());
            return;
        }
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        orderEventPublisher.publishOrderConfirmed(orderConfirmedEventMapper.toEvent(order));
    }

    public void handlePaymentFailed(PaymentFailedEvent event) {
        Optional<Order> opt = orderRepository.findById(event.getOrderId());
        if (opt.isEmpty()) {
            log.warn("Order not found for payment.failed: orderId={}", event.getOrderId());
            return;
        }
        Order order = opt.get();
        if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            log.info("Order already processed: orderId={}, status={}", order.getId(), order.getStatus());
            return;
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        String reason = event.getReason() != null ? event.getReason() : "Payment failed";
        var source = new OrderCancelledEventSource(order, reason);
        orderEventPublisher.publishOrderCancelled(orderCancelledEventMapper.toEvent(source));
    }
}
