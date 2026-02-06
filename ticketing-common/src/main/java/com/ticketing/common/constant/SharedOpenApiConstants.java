package com.ticketing.common.constant;

/**
 * OpenAPI / Swagger constants shared across all services.
 * Single source of truth for server URL template, description, and version.
 */
public final class SharedOpenApiConstants {

    public static final String SERVER_URL_TEMPLATE = "http://localhost:%d";
    public static final String SERVER_DESCRIPTION = "Local server";
    public static final String API_VERSION = "1.0.0";

    private SharedOpenApiConstants() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
