package com.ticketing.reservation.repository;

import com.ticketing.common.exception.ConflictException;
import com.ticketing.reservation.entity.HoldData;

import java.util.Set;

/**
 * Repository for hold data and seat locks in Redis.
 */
public interface HoldDataRepository {

    /**
     * Acquires all seats with SET NX EX 420 (value = userId). All-or-nothing on conflict.
     */
    Set<String> acquireSeatLocks(String showId, Set<String> seatIds, String userId) throws ConflictException;

    /**
     * Per-seat SET NX; idempotent if this user already holds the seat.
     */
    SeatBatchResult tryAcquireSeatsPartial(String showId, Set<String> seatIds, String userId);

    void save(HoldData holdData);

    /** Saves hold payload with explicit TTL (ms). */
    void saveWithTtl(HoldData holdData, long ttlMs);

    void saveHoldMeta(String holdId, String showId, Set<String> seatIds);

    HoldData findById(String holdId);

    HoldMeta findHoldMeta(String holdId);

    void delete(String holdId, String showId, Set<String> seatIds);

    void deleteSeatLocks(String showId, Set<String> seatIds);

    void deleteHoldMeta(String holdId);

    Set<String> findLockedSeatIdsForShow(String showId);

    /** Deletes seat key only if value matches userId. */
    Set<String> releaseSeatsIfOwned(String showId, Set<String> seatIds, String userId);

    /** Refreshes seat TTL for seats owned by user. */
    int extendSeatsTtlIfOwned(String showId, Set<String> seatIds, String userId, long ttlSeconds);

    /** Canonical holdId for (show, user), or null. */
    String getActiveHoldId(String showId, String userId);

    void setActiveHoldId(String showId, String userId, String holdId);

    void deleteActiveHoldId(String showId, String userId);
}
