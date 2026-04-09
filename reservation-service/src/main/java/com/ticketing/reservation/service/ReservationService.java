package com.ticketing.reservation.service;

import com.ticketing.reservation.dto.BatchHoldRequest;
import com.ticketing.reservation.dto.BatchHoldResponse;
import com.ticketing.reservation.dto.BatchReleaseRequest;
import com.ticketing.reservation.dto.BatchReleaseResponse;
import com.ticketing.reservation.dto.ExtendHoldRequest;
import com.ticketing.reservation.dto.ExtendHoldResponse;
import com.ticketing.reservation.dto.HoldResponse;

import java.util.Set;

/**
 * Service interface for seat reservation/hold operations.
 * DIP: controller depends on abstraction.
 */
public interface ReservationService {

    HoldResponse createHold(String showId, Set<String> seatIds, String userId);

    BatchHoldResponse batchHold(BatchHoldRequest request);

    BatchReleaseResponse batchRelease(BatchReleaseRequest request);

    ExtendHoldResponse extendHold(ExtendHoldRequest request);

    void releaseHold(String holdId);

    /**
     * Seat IDs currently on hold (Redis locks) for this show.
     */
    Set<String> getLockedSeatIdsForShow(String showId);
}
