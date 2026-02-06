package com.ticketing.availability.service;

import com.ticketing.availability.entity.SeatAvailability;

/**
 * Service interface for seat availability operations.
 * DIP: controller depends on abstraction.
 */
public interface AvailabilityService {

    SeatAvailability getShowAvailability(String showId);
}
