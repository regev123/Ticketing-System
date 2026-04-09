package com.ticketing.availability.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * WebClient configuration for catalog, reservation, and order service calls.
 */
@Configuration
public class WebClientConfig {

    @Bean(name = "catalogWebClient")
    public WebClient catalogWebClient(WebClient.Builder builder,
                                      @Value("${catalog.service.url:http://localhost:8081}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }

    @Bean(name = "reservationWebClient")
    public WebClient reservationWebClient(WebClient.Builder builder,
                                          @Value("${reservation.service.url:http://localhost:8083}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }

    @Bean(name = "orderWebClient")
    public WebClient orderWebClient(WebClient.Builder builder,
                                    @Value("${order.service.url:http://localhost:8084}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }
}
