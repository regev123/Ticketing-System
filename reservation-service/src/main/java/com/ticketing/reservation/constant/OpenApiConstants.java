package com.ticketing.reservation.constant;

import com.ticketing.common.constant.SharedOpenApiConstants;

/**
 * OpenAPI metadata constants for reservation-service.
 */
public final class OpenApiConstants {

    public static final String API_TITLE = "Reservation Service API";
    public static final String API_DESCRIPTION = "Seat holds with Redis locks - anti-double-booking";
    public static final String API_VERSION = SharedOpenApiConstants.API_VERSION;

    private OpenApiConstants() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
