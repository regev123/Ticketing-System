package com.ticketing.catalog.mapper;

import com.ticketing.catalog.entity.Show;
import com.ticketing.common.contract.catalog.CatalogSeatResponse;
import com.ticketing.common.contract.catalog.CatalogShowResponse;
import com.ticketing.common.mapper.ToDtoMapper;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Maps Show entity to CatalogShowResponse (common contract).
 * Implements ToDtoMapper - use when exposing show data via shared contract.
 */
@Component
public class ShowMapper implements ToDtoMapper<Show, CatalogShowResponse> {

    @Override
    public CatalogShowResponse toDto(Show entity) {
        List<CatalogSeatResponse> seats = entity.getSeats() == null ? List.of() :
                entity.getSeats().stream()
                        .map(s -> new CatalogSeatResponse(
                                s.id(),
                                s.section(),
                                s.row(),
                                s.number(),
                                s.price(),
                                s.currency()
                        ))
                        .toList();
        String startTime = entity.getStartTime() != null ? entity.getStartTime().toString() : null;
        return new CatalogShowResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getVenueId(),
                startTime,
                seats
        );
    }
}
