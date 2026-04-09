package com.ticketing.order.service.impl;

import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;
import com.ticketing.order.entity.Order;
import com.ticketing.order.entity.OrderStatus;
import com.ticketing.order.event.PaymentEventPublisher;
import com.ticketing.order.integration.OrderSeatHoldVerifier;
import com.ticketing.order.integration.ReservationHoldClient;
import com.ticketing.order.mapper.OrderMapper;
import com.ticketing.order.mapper.event.OrderToPaymentRequestedEventMapper;
import com.ticketing.order.repository.OrderRepository;
import com.ticketing.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Order service implementation.
 * SRP: orchestrate order creation, persistence, and payment.event publishing.
 * DIP: depends on OrderMapper, PaymentEventPublisher, OrderRepository interfaces.
 */
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderToPaymentRequestedEventMapper paymentRequestedEventMapper;
    private final PaymentEventPublisher paymentEventPublisher;
    private final OrderSeatHoldVerifier seatHoldVerifier;
    private final ReservationHoldClient reservationHoldClient;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        seatHoldVerifier.verifyBeforeOrder(request);

        Order order = orderMapper.toEntity(request);
        order = orderRepository.save(order);

        paymentEventPublisher.publish(paymentRequestedEventMapper.toEvent(order));

        reservationHoldClient.releaseHold(request.getHoldId());

        return orderMapper.toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<String> getUnavailableSeatIdsForShow(String showId) {
        List<Order> orders = orderRepository.findByShowIdAndStatusIn(
                showId, List.of(OrderStatus.PAYMENT_PENDING, OrderStatus.CONFIRMED));
        Set<String> ids = new HashSet<>();
        for (Order o : orders) {
            if (o.getSeatIds() != null) {
                ids.addAll(o.getSeatIds());
            }
        }
        return ids;
    }
}
