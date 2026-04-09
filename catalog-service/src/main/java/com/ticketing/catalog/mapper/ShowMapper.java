package com.ticketing.catalog.mapper;

import com.ticketing.catalog.entity.Show;
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
        List<CatalogShowResponse.CatalogSeatResponse> seats = entity.getSeats() == null
                ? List.of()
                : entity.getSeats().stream()
                        .map(s -> new CatalogShowResponse.CatalogSeatResponse(
                                s.id(),
                                s.section(),
                                s.row(),
                                s.number(),
                                s.price(),
                                s.currency()
                        ))
                        .toList();
        String startTime = entity.getStartTime() != null ? entity.getStartTime().toString() : null;
        String doorsOpenTime = entity.getDoorsOpenTime() != null ? entity.getDoorsOpenTime().toString() : null;
        String endTime = entity.getEndTime() != null ? entity.getEndTime().toString() : null;
        return new CatalogShowResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getCategory(),
                entity.getDescription(),
                doorsOpenTime,
                startTime,
                endTime,
                seats
        );
    }
}
