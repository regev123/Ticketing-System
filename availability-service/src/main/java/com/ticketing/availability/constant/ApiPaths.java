package com.ticketing.availability.constant;

/**
 * API path constants for availability-service.
 */
public final class ApiPaths {

    public static final String AVAILABILITY = "/api/availability";
    public static final String SHOW_BY_ID = "/{showId}";
    /** POST — evict Redis cache for this show (called when holds/orders change). */
    public static final String EVICT_CACHE = "/{showId}/cache/evict";

    private ApiPaths() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
