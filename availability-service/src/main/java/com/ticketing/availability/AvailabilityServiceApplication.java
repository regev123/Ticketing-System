package com.ticketing.availability;

import com.ticketing.common.config.WebConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Import;

/**
 * Availability service entry point.
 * Caches show seat data from catalog in Redis for fast reads.
 */
@SpringBootApplication
@EnableCaching
@Import(WebConfig.class)
public class AvailabilityServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AvailabilityServiceApplication.class, args);
    }
}
