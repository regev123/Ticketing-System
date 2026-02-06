package com.ticketing.order.service.impl;

import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;
import com.ticketing.order.entity.Order;
import com.ticketing.order.event.PaymentEventPublisher;
import com.ticketing.order.mapper.OrderMapper;
import com.ticketing.order.mapper.event.OrderToPaymentRequestedEventMapper;
import com.ticketing.order.repository.OrderRepository;
import com.ticketing.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Order service implementation.
 * SRP: orchestrate order creation, persistence, and payment.event publishing.
 * DIP: depends on OrderMapper, PaymentEventPublisher, OrderRepository interfaces.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderToPaymentRequestedEventMapper paymentRequestedEventMapper;
    private final PaymentEventPublisher paymentEventPublisher;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = orderMapper.toEntity(request);
        order = orderRepository.save(order);

        paymentEventPublisher.publish(paymentRequestedEventMapper.toEvent(order));

        return orderMapper.toDto(order);
    }
}
