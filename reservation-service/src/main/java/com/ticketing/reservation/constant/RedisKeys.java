package com.ticketing.reservation.constant;

/**
 * Redis keys: seat:{showId}:{seatId} -> userId (SET NX EX 420), hold:{holdId} -> JSON.
 */
public final class RedisKeys {

    /** User-scoped seat locks — matches SET seat:{showId}:{seatId} userId NX EX 420 */
    public static final String SEAT_KEY_PREFIX = "seat:";
    public static final String HOLD_PREFIX = "hold:";
    public static final String HOLD_META_PREFIX = "holdmeta:";
    public static final String KEY_DELIMITER = ":";
    /** 7 minutes — EX 420 */
    public static final long SEAT_HOLD_TTL_SECONDS = 420L;
    public static final long HOLD_TTL_MS = 7 * 60 * 1000;
    public static final long HOLD_META_TTL_MS = 8 * 60 * 1000;

    private RedisKeys() {
        throw new UnsupportedOperationException("Constants class - do not instantiate");
    }

    public static String userSeatKey(String showId, String seatId) {
        return SEAT_KEY_PREFIX + showId + KEY_DELIMITER + seatId;
    }

    public static String holdKey(String holdId) {
        return HOLD_PREFIX + holdId;
    }

    public static String holdMetaKey(String holdId) {
        return HOLD_META_PREFIX + holdId;
    }

    /** Points to the canonical holdId for this user on this show (one active hold per user per show). */
    public static String userActiveHoldKey(String showId, String userId) {
        return "useractivehold:" + showId + KEY_DELIMITER + userId;
    }
}
