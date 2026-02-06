package com.ticketing.catalog.constant;

/**
 * API path constants for catalog-service.
 */
public final class ApiPaths {

    public static final String SHOWS = "/api/shows";
    public static final String SHOW_BY_ID = "/{id}";

    private ApiPaths() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
