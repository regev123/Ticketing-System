package com.ticketing.reservation.constant;

/**
 * API path constants for reservation-service.
 */
public final class ApiPaths {

    public static final String RESERVATIONS = "/api/reservations";
    public static final String HOLD_BY_ID = "/{holdId}";
    /** GET locked seat IDs for a show (Redis seat locks). */
    public static final String SHOW_LOCKED_SEATS = "/shows/{showId}/locked-seats";
    public static final String BATCH_HOLD = "/hold";
    public static final String BATCH_RELEASE = "/release";
    public static final String EXTEND_HOLD = "/extend-hold";

    private ApiPaths() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
