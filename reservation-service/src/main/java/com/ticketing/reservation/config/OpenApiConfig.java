package com.ticketing.reservation.config;

import com.ticketing.common.config.OpenApiConfigurer;
import com.ticketing.reservation.constant.OpenApiConstants;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration for reservation-service.
 * Delegates to OpenApiConfigurer for consistent structure.
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8083}")
    private int serverPort;

    @Bean
    public OpenAPI reservationOpenApi() {
        return OpenApiConfigurer.createOpenApi(
                OpenApiConstants.API_TITLE,
                OpenApiConstants.API_DESCRIPTION,
                OpenApiConstants.API_VERSION,
                serverPort
        );
    }
}
