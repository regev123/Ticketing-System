package com.ticketing.order.mapper;

import com.ticketing.common.mapper.ToDtoMapper;
import com.ticketing.common.mapper.ToEntityMapper;
import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;
import com.ticketing.order.entity.Order;
import com.ticketing.order.entity.OrderStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Maps between Order entity and DTOs.
 * Implements both ToEntityMapper and ToDtoMapper.
 */
@Component
public class OrderMapper implements ToEntityMapper<CreateOrderRequest, Order>, ToDtoMapper<Order, OrderResponse> {

    @Override
    public Order toEntity(CreateOrderRequest source) {
        Order order = new Order();
        order.setId(java.util.UUID.randomUUID().toString());
        order.setHoldId(source.getHoldId());
        order.setShowId(source.getShowId());
        order.setSeatIds(source.getSeatIds());
        order.setUserId(source.getUserId());
        order.setAmount(source.getAmount());
        order.setCurrency(source.getCurrency());
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        order.setCreatedAt(Instant.now());
        return order;
    }

    @Override
    public OrderResponse toDto(Order entity) {
        return OrderResponse.builder()
                .id(entity.getId())
                .holdId(entity.getHoldId())
                .showId(entity.getShowId())
                .seatIds(entity.getSeatIds())
                .userId(entity.getUserId())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
