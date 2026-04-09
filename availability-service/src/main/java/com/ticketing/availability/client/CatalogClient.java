package com.ticketing.availability.client;

import com.ticketing.common.contract.catalog.CatalogShowResponse;
import reactor.core.publisher.Mono;

/**
 * Client interface for catalog service.
 * DIP: availability service depends on abstraction, not HTTP implementation.
 */
public interface CatalogClient {

    /**
     * Fetches full show payload from catalog (all seats). Availability layer filters holds/orders.
     */
    Mono<CatalogShowResponse> fetchCatalogShow(String showId);
}
