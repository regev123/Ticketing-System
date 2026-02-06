package com.ticketing.catalog;

import com.ticketing.common.config.WebConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * Catalog service entry point.
 * Manages show and venue data in MongoDB.
 */
@SpringBootApplication
@Import(WebConfig.class)
public class CatalogServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatalogServiceApplication.class, args);
    }
}
