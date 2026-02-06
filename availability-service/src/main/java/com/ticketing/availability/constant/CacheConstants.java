package com.ticketing.availability.constant;

/**
 * Redis cache key and TTL constants.
 */
public final class CacheConstants {

    public static final String CACHE_NAME = "availability";
    public static final String CACHE_KEY_PREFIX = "availability:show:";
    public static final long TTL_MINUTES = 5;

    private CacheConstants() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }

    public static String cacheKey(String showId) {
        return CACHE_KEY_PREFIX + showId;
    }
}
