package com.ticketing.common.constant;

/**
 * HTTP status code constants for consistent use across services.
 * Single source of truth - avoid magic numbers.
 *
 * <p>Use {@code int} constants for comparisons (e.g. WebClient responses).
 * Use {@code String} constants for OpenAPI/Swagger {@code @ApiResponse(responseCode = ...)}.
 */
public final class HttpStatusCodes {

    // 2xx Success (int)
    public static final int OK = 200;
    public static final int CREATED = 201;
    public static final int NO_CONTENT = 204;

    // 3xx Redirection (int)
    public static final int MOVED_PERMANENTLY = 301;
    public static final int FOUND = 302;
    public static final int NOT_MODIFIED = 304;

    // 4xx Client Error (int)
    public static final int BAD_REQUEST = 400;
    public static final int UNAUTHORIZED = 401;
    public static final int FORBIDDEN = 403;
    public static final int NOT_FOUND = 404;
    public static final int METHOD_NOT_ALLOWED = 405;
    public static final int CONFLICT = 409;
    public static final int UNPROCESSABLE_ENTITY = 422;

    // 5xx Server Error (int)
    public static final int INTERNAL_SERVER_ERROR = 500;
    public static final int BAD_GATEWAY = 502;
    public static final int SERVICE_UNAVAILABLE = 503;
    public static final int GATEWAY_TIMEOUT = 504;

    // String constants for OpenAPI @ApiResponse(responseCode = ...)
    public static final String OK_STR = "200";
    public static final String CREATED_STR = "201";
    public static final String NO_CONTENT_STR = "204";
    public static final String BAD_REQUEST_STR = "400";
    public static final String UNAUTHORIZED_STR = "401";
    public static final String FORBIDDEN_STR = "403";
    public static final String NOT_FOUND_STR = "404";
    public static final String CONFLICT_STR = "409";
    public static final String INTERNAL_SERVER_ERROR_STR = "500";

    private HttpStatusCodes() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
