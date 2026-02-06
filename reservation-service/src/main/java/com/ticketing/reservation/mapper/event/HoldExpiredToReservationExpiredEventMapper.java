package com.ticketing.reservation.mapper.event;

import com.ticketing.common.mapper.ToEventMapper;
import com.ticketing.events.reservation.ReservationExpiredEvent;
import org.springframework.stereotype.Component;

/**
 * Maps ReservationExpiredEventSource to ReservationExpiredEvent for Kafka publishing.
 */
@Component
public class HoldExpiredToReservationExpiredEventMapper
        implements ToEventMapper<ReservationExpiredEventSource, ReservationExpiredEvent> {

    @Override
    public ReservationExpiredEvent toEvent(ReservationExpiredEventSource source) {
        var event = new ReservationExpiredEvent();
        event.setHoldId(source.getHoldId());
        event.setShowId(source.getShowId());
        event.setSeatIds(source.getSeatIds() != null ? source.getSeatIds() : java.util.Set.of());
        return event;
    }
}
