package com.ticketing.reservation.service;

import com.ticketing.reservation.dto.HoldResponse;

import java.util.Set;

/**
 * Service interface for seat reservation/hold operations.
 * DIP: controller depends on abstraction.
 */
public interface ReservationService {

    HoldResponse createHold(String showId, Set<String> seatIds, String userId);

    void releaseHold(String holdId);
}
