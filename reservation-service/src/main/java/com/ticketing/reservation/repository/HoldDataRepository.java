package com.ticketing.reservation.repository;

import com.ticketing.common.exception.ConflictException;
import com.ticketing.reservation.entity.HoldData;

import java.util.Set;

/**
 * Repository for hold data and seat locks in Redis.
 * Abstracts storage, retrieval, and lock management.
 */
public interface HoldDataRepository {

    /**
     * Acquires seat locks with SET NX PX. Returns locked seat IDs.
     *
     * @throws ConflictException if any seat is already held
     */
    Set<String> acquireSeatLocks(String showId, Set<String> seatIds, String holdId);

    /**
     * Saves hold data with TTL. Locks must be acquired first.
     */
    void save(HoldData holdData);

    /**
     * Saves hold metadata (showId, seatIds) with longer TTL for expiry event.
     */
    void saveHoldMeta(String holdId, String showId, Set<String> seatIds);

    /**
     * Finds hold by ID. Returns null if not found or expired.
     */
    HoldData findById(String holdId);

    /**
     * Retrieves hold metadata for expiry event. Returns null if not found.
     */
    HoldMeta findHoldMeta(String holdId);

    /**
     * Deletes hold, metadata, and seat locks.
     */
    void delete(String holdId, String showId, Set<String> seatIds);

    /**
     * Deletes seat locks only (for rollback on conflict).
     */
    void deleteSeatLocks(String showId, Set<String> seatIds);

    /**
     * Deletes hold metadata.
     */
    void deleteHoldMeta(String holdId);

    /**
     * Hold metadata for expiry event.
     */
    record HoldMeta(String holdId, String showId, Set<String> seatIds) {}
}
