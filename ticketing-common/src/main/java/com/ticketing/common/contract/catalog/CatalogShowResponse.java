package com.ticketing.common.contract.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.List;

/**
 * Catalog service API response contract for a show.
 * Single source of truth for services consuming catalog API (availability, order, reservation).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CatalogShowResponse(
        String id,
        String title,
        String venueId,
        String startTime,
        List<CatalogSeatResponse> seats
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CatalogSeatResponse(
            String id,
            String section,
            int row,
            int number,
            BigDecimal price,
            String currency
    ) {}
}
