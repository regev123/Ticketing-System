package com.ticketing.common.exception;

import java.time.Instant;

/**
 * Standard API error response structure.
 * Immutable record for consistent error representation across services.
 */
public record ErrorResponse(String code, String message, Instant timestamp) {

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, Instant.now());
    }
}
