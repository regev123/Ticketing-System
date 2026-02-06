package com.ticketing.reservation.constant;

/**
 * API path constants for reservation-service.
 */
public final class ApiPaths {

    public static final String RESERVATIONS = "/api/reservations";
    public static final String HOLD_BY_ID = "/{holdId}";

    private ApiPaths() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
