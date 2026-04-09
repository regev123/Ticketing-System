package com.ticketing.order.repository;

import com.ticketing.order.entity.Order;
import com.ticketing.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * JPA repository for Order entities.
 * ISP: extends JpaRepository with Order-specific operations.
 */
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByShowIdAndStatusIn(String showId, List<OrderStatus> statuses);
}
