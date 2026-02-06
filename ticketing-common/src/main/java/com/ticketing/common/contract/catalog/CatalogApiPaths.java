package com.ticketing.common.contract.catalog;

/**
 * Catalog service API path constants.
 * Single source of truth for services consuming catalog API.
 */
public final class CatalogApiPaths {

    public static final String SHOWS = "/api/shows";
    public static final String SHOW_BY_ID = "/api/shows/{id}";

    private CatalogApiPaths() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
