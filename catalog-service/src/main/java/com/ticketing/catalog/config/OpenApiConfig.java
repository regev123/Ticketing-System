package com.ticketing.catalog.config;

import com.ticketing.catalog.constant.OpenApiConstants;
import com.ticketing.common.config.OpenApiConfigurer;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration for catalog-service.
 * Delegates to OpenApiConfigurer for consistent structure.
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8081}")
    private int serverPort;

    @Bean
    public OpenAPI catalogOpenApi() {
        return OpenApiConfigurer.createOpenApi(
                OpenApiConstants.API_TITLE,
                OpenApiConstants.API_DESCRIPTION,
                OpenApiConstants.API_VERSION,
                serverPort
        );
    }
}
