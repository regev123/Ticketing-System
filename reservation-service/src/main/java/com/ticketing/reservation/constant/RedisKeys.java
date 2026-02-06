package com.ticketing.reservation.constant;

/**
 * Redis key patterns for seat locks and holds.
 * Anti-double-booking: seatlock:{showId}:{seatId} -> holdId, TTL 7 min.
 */
public final class RedisKeys {

    public static final String SEAT_LOCK_PREFIX = "seatlock:";
    public static final String HOLD_PREFIX = "hold:";
    public static final String HOLD_META_PREFIX = "holdmeta:";
    public static final String KEY_DELIMITER = ":";
    public static final long HOLD_TTL_MS = 7 * 60 * 1000; // 7 minutes
    public static final long HOLD_META_TTL_MS = 8 * 60 * 1000; // 8 min - slightly longer for expiry event

    private RedisKeys() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }

    public static String seatLockKey(String showId, String seatId) {
        return SEAT_LOCK_PREFIX + showId + KEY_DELIMITER + seatId;
    }

    public static String holdKey(String holdId) {
        return HOLD_PREFIX + holdId;
    }

    public static String holdMetaKey(String holdId) {
        return HOLD_META_PREFIX + holdId;
    }
}
