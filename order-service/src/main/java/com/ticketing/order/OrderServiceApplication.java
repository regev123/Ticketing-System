package com.ticketing.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Order service entry point.
 * Manages orders in PostgreSQL, publishes payment.requested, consumes payment.succeeded/failed,
 * publishes order.confirmed/cancelled.
 */
@SpringBootApplication(scanBasePackages = {"com.ticketing.order", "com.ticketing.common"})
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
