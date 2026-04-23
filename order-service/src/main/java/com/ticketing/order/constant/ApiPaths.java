package com.ticketing.order.constant;

/**
 * API path constants for order-service.
 */
public final class ApiPaths {

    public static final String ORDERS = "/api/orders";
    public static final String ADMIN_METRICS = "/admin/metrics";
    public static final String MY_ORDERS = "/me";
    public static final String CHECKIN_SCAN = "/check-in/scan";
    public static final String MY_ORDER_BY_ID = "/me/{orderId}";
    public static final String MY_ORDER_CANCEL_SEATS = "/me/{orderId}/cancel-seats";
    public static final String MY_ORDER_CANCEL = "/me/{orderId}/cancel";
    public static final String MY_ORDER_TICKET_BY_SEAT = "/me/{orderId}/tickets/{seatId}.pdf";
    public static final String SHOW_UNAVAILABLE_SEAT_IDS = "/shows/{showId}/unavailable-seat-ids";

    private ApiPaths() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
