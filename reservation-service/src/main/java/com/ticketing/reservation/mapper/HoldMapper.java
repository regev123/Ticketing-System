package com.ticketing.reservation.mapper;

import com.ticketing.common.mapper.ToDtoMapper;
import com.ticketing.reservation.dto.HoldResponse;
import com.ticketing.reservation.entity.HoldData;
import org.springframework.stereotype.Component;

/**
 * Maps HoldData entity to HoldResponse DTO.
 * Implements ToDtoMapper; HoldData is built internally from service params.
 */
@Component
public class HoldMapper implements ToDtoMapper<HoldData, HoldResponse> {

    @Override
    public HoldResponse toDto(HoldData entity) {
        return HoldResponse.builder()
                .holdId(entity.getHoldId())
                .showId(entity.getShowId())
                .seatIds(entity.getSeatIds())
                .userId(entity.getUserId())
                .expiresAt(entity.getExpiresAt())
                .build();
    }
}
