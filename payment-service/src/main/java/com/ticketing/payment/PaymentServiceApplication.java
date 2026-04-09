package com.ticketing.payment;

import com.ticketing.common.config.WebConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * Payment service entry point.
 * Mock payment processor: consumes payment.requested from Kafka,
 * publishes payment.succeeded or payment.failed.
 */
@SpringBootApplication
@Import(WebConfig.class)
public class PaymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
}
