package com.ticketing.order;

import com.ticketing.common.config.WebConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * Order service entry point.
 * Manages orders in PostgreSQL, publishes payment.requested, consumes payment.succeeded/failed,
 * publishes order.confirmed/cancelled.
 */
@SpringBootApplication
@Import(WebConfig.class)
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
