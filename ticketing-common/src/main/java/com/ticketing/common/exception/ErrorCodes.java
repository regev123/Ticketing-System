package com.ticketing.common.exception;

/**
 * Centralized error codes used across API exception responses.
 * Single source of truth for consistency and easier maintenance.
 */
public final class ErrorCodes {

    public static final String NOT_FOUND = "NOT_FOUND";
    public static final String CONFLICT = "CONFLICT";
    public static final String BAD_REQUEST = "BAD_REQUEST";
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String FORBIDDEN = "FORBIDDEN";
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";

    private ErrorCodes() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
