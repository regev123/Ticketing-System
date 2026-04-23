package com.ticketing.order.entity;

/**
 * Order lifecycle status.
 */
public enum OrderStatus {
    PAYMENT_PENDING,
    CONFIRMED,
    PARTIALLY_CANCELLED,
    CANCELLED
}
