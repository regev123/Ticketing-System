package com.ticketing.reservation.mapper.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

/**
 * Context for building ReservationExpiredEvent (holdId + showId + seatIds).
 */
@Getter
@AllArgsConstructor
public class ReservationExpiredEventSource {
    private final String holdId;
    private final String showId;
    private final Set<String> seatIds;
}
