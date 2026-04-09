package com.ticketing.common.contract.catalog;

import java.math.BigDecimal;
import java.util.List;

/**
 * Catalog service API response contract for a show.
 * Single source of truth for services consuming catalog API (availability, order, reservation).
 */
public record CatalogShowResponse(
        String id,
        String title,
        String category,
        String description,
        String doorsOpenTime,
        String startTime,
        String endTime,
        List<CatalogSeatResponse> seats
) {
    public record CatalogSeatResponse(
            String id,
            String section,
            int row,
            int number,
            BigDecimal price,
            String currency
    ) {}
}
