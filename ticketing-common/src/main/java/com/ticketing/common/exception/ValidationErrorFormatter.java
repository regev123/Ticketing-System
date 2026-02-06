package com.ticketing.common.exception;

import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.stream.Collectors;

/**
 * Formats validation errors from MethodArgumentNotValidException.
 * Single responsibility: transform binding errors into a readable string.
 */
public final class ValidationErrorFormatter {

    private static final String FIELD_ERROR_FORMAT = "%s: %s";
    private static final String FIELD_ERROR_DELIMITER = ", ";

    private ValidationErrorFormatter() {
        throw new UnsupportedOperationException("Utility class - do not instantiate");
    }

    public static String format(MethodArgumentNotValidException ex) {
        return ex.getBindingResult().getFieldErrors().stream()
                .map(error -> String.format(FIELD_ERROR_FORMAT, error.getField(), error.getDefaultMessage()))
                .collect(Collectors.joining(FIELD_ERROR_DELIMITER));
    }
}
