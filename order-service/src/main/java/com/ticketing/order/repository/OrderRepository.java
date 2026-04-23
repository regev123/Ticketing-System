package com.ticketing.order.repository;

import com.ticketing.order.entity.Order;
import com.ticketing.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

/**
 * JPA repository for Order entities.
 * ISP: extends JpaRepository with Order-specific operations.
 */
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByShowIdAndStatusIn(String showId, List<OrderStatus> statuses);

    Page<Order> findByUserId(String userId, Pageable pageable);

    Optional<Order> findByIdAndUserId(String id, String userId);

    List<Order> findByCreatedAtAfter(Instant createdAt);
}
