package com.ticketing.availability.constant;

import com.ticketing.common.constant.SharedOpenApiConstants;

/**
 * OpenAPI metadata constants for availability-service.
 */
public final class OpenApiConstants {

    public static final String API_TITLE = "Availability Service API";
    public static final String API_DESCRIPTION = "Seat availability - cached from catalog";
    public static final String API_VERSION = SharedOpenApiConstants.API_VERSION;

    private OpenApiConstants() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
