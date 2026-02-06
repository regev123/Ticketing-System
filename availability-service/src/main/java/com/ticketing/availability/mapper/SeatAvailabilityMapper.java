package com.ticketing.availability.mapper;

import com.ticketing.availability.entity.SeatAvailability;
import com.ticketing.common.contract.catalog.CatalogShowResponse;
import com.ticketing.common.mapper.ToEntityMapper;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Maps CatalogShowResponse to SeatAvailability.
 * Implements ToEntityMapper - external contract to internal entity.
 */
@Component
public class SeatAvailabilityMapper implements ToEntityMapper<CatalogShowResponse, SeatAvailability> {

    @Override
    public SeatAvailability toEntity(CatalogShowResponse response) {
        var seatInfos = mapSeats(response.seats());
        return SeatAvailability.builder()
                .showId(response.id())
                .showTitle(response.title())
                .seats(seatInfos)
                .build();
    }

    private List<SeatAvailability.SeatInfo> mapSeats(List<CatalogShowResponse.CatalogSeatResponse> seats) {
        return seats.stream()
                .map(this::toSeatInfo)
                .toList();
    }

    private SeatAvailability.SeatInfo toSeatInfo(CatalogShowResponse.CatalogSeatResponse seat) {
        return SeatAvailability.SeatInfo.builder()
                .id(seat.id())
                .section(seat.section())
                .row(seat.row())
                .number(seat.number())
                .price(seat.price())
                .currency(seat.currency())
                .build();
    }
}
