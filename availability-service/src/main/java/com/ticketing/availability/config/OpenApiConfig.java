package com.ticketing.availability.config;

import com.ticketing.availability.constant.OpenApiConstants;
import com.ticketing.common.config.OpenApiConfigurer;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration for availability-service.
 * Delegates to OpenApiConfigurer for consistent structure.
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8082}")
    private int serverPort;

    @Bean
    public OpenAPI availabilityOpenApi() {
        return OpenApiConfigurer.createOpenApi(
                OpenApiConstants.API_TITLE,
                OpenApiConstants.API_DESCRIPTION,
                OpenApiConstants.API_VERSION,
                serverPort
        );
    }
}
