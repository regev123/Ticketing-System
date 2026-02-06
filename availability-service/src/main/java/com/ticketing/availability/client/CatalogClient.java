package com.ticketing.availability.client;

import com.ticketing.availability.entity.SeatAvailability;
import reactor.core.publisher.Mono;

/**
 * Client interface for catalog service.
 * DIP: availability service depends on abstraction, not HTTP implementation.
 */
public interface CatalogClient {

    /**
     * Fetches seat availability for a show from catalog service.
     *
     * @param showId the show ID
     * @return Mono of SeatAvailability, or error if show not found
     */
    Mono<SeatAvailability> getShowAvailability(String showId);
}
