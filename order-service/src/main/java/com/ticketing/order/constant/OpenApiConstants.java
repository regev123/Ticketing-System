package com.ticketing.order.constant;

import com.ticketing.common.constant.SharedOpenApiConstants;

/**
 * OpenAPI metadata constants for order-service.
 */
public final class OpenApiConstants {

    public static final String API_TITLE = "Order API";
    public static final String API_DESCRIPTION = "Order management - create orders, payment flow, order confirmed/cancelled";
    public static final String API_VERSION = SharedOpenApiConstants.API_VERSION;

    private OpenApiConstants() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
