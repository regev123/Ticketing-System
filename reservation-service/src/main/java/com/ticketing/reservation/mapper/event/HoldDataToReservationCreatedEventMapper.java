package com.ticketing.reservation.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.reservation.ReservationCreatedEvent;
import com.ticketing.reservation.entity.HoldData;
import org.springframework.stereotype.Component;

/**
 * Maps HoldData to ReservationCreatedEvent for Kafka publishing.
 */
@Component
public class HoldDataToReservationCreatedEventMapper implements ToEventMapper<HoldData, ReservationCreatedEvent> {

    @Override
    public ReservationCreatedEvent toEvent(HoldData source) {
        var event = new ReservationCreatedEvent();
        event.setHoldId(source.getHoldId());
        event.setShowId(source.getShowId());
        event.setSeatIds(source.getSeatIds());
        event.setUserId(source.getUserId());
        event.setExpiresAt(source.getExpiresAt());
        return event;
    }
}
