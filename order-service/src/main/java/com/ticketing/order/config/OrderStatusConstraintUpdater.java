package com.ticketing.order.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class OrderStatusConstraintUpdater {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner updateOrdersStatusCheckConstraint() {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
                jdbcTemplate.execute("""
                        ALTER TABLE orders
                        ADD CONSTRAINT orders_status_check
                        CHECK (status IN ('PAYMENT_PENDING', 'CONFIRMED', 'PARTIALLY_CANCELLED', 'CANCELLED'))
                        """);
                log.info("orders_status_check constraint updated to include PARTIALLY_CANCELLED");
            } catch (Exception e) {
                log.warn("Could not update orders_status_check constraint automatically: {}", e.getMessage());
            }
        };
    }
}
