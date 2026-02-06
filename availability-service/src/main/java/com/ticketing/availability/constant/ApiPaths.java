package com.ticketing.availability.constant;

/**
 * API path constants for availability-service.
 */
public final class ApiPaths {

    public static final String AVAILABILITY = "/api/availability";
    public static final String SHOW_BY_ID = "/{showId}";

    private ApiPaths() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
