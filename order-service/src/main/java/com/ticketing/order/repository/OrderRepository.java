package com.ticketing.order.repository;

import com.ticketing.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * JPA repository for Order entities.
 * ISP: extends JpaRepository with Order-specific operations.
 */
public interface OrderRepository extends JpaRepository<Order, String> {
}
