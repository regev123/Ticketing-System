package com.ticketing.common.config;

import com.ticketing.common.constant.SharedOpenApiConstants;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

import java.util.List;

/**
 * Factory for OpenAPI configuration.
 * Single Responsibility: create OpenAPI beans with consistent structure.
 * Reduces duplication across services - each service provides title, description, version, port.
 */
public final class OpenApiConfigurer {

    private OpenApiConfigurer() {
        throw new UnsupportedOperationException("Utility class - do not instantiate");
    }

    public static OpenAPI createOpenApi(String title, String description, String version, int serverPort) {
        return new OpenAPI()
                .info(createInfo(title, description, version))
                .servers(createServers(serverPort));
    }

    private static Info createInfo(String title, String description, String version) {
        return new Info()
                .title(title)
                .description(description)
                .version(version);
    }

    private static List<Server> createServers(int serverPort) {
        return List.of(
                new Server()
                        .url(SharedOpenApiConstants.SERVER_URL_TEMPLATE.formatted(serverPort))
                        .description(SharedOpenApiConstants.SERVER_DESCRIPTION)
        );
    }
}
