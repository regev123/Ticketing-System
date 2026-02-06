package com.ticketing.availability.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * WebClient configuration for external service calls (e.g. catalog-service).
 */
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient(WebClient.Builder builder,
                               @Value("${catalog.service.url:http://localhost:8081}") String catalogBaseUrl) {
        return builder
                .baseUrl(catalogBaseUrl)
                .build();
    }
}
