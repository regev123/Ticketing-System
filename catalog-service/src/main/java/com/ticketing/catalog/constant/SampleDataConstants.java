package com.ticketing.catalog.constant;

import java.math.BigDecimal;

/**
 * Constants for sample/dev data seeding.
 */
public final class SampleDataConstants {

    public static final String DEFAULT_SECTION = "A";
    public static final String DEFAULT_CURRENCY = "USD";
    public static final BigDecimal DEFAULT_SEAT_PRICE = new BigDecimal("49.99");
    public static final int SEAT_COUNT = 50;
    public static final int DAYS_UNTIL_SHOW = 7;
    public static final String SAMPLE_SHOW_TITLE = "Rock Concert 2025";
    public static final String SAMPLE_VENUE_ID = "venue-1";

    private SampleDataConstants() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
