package com.ticketing.catalog.constant;

import com.ticketing.common.constant.SharedOpenApiConstants;

/**
 * OpenAPI metadata constants for catalog-service.
 */
public final class OpenApiConstants {

    public static final String API_TITLE = "Catalog Service API";
    public static final String API_DESCRIPTION = "Show and venue catalog for the ticket booking platform";
    public static final String API_VERSION = SharedOpenApiConstants.API_VERSION;

    private OpenApiConstants() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
