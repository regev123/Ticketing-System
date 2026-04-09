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
    public static final String SAMPLE_SHOW_CATEGORY = "music";
    public static final String SAMPLE_SHOW_DESCRIPTION = "Sample seeded show for local development.";
    // Sample denormalized venue data (stored inside each show document).
    public static final String SAMPLE_VENUE_NAME = "Sample Venue";
    public static final String SAMPLE_CITY = "Sample City";
    public static final String SAMPLE_COUNTRY = "Sample Country";
    public static final String SAMPLE_ADDRESS = "Sample Address";
    public static final double SAMPLE_GEO_LAT = 32.0853;
    public static final double SAMPLE_GEO_LNG = 34.7818;

    private SampleDataConstants() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }
}
