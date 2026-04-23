package com.ticketing.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Catalog service entry point.
 * Manages show and venue data in MongoDB.
 */
@SpringBootApplication(scanBasePackages = {"com.ticketing.catalog", "com.ticketing.common"})
public class CatalogServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatalogServiceApplication.class, args);
    }
}
