package com.ticketing.events.reservation;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.ticketing.events.BaseEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

/** Event emitted when a hold expires without conversion to order. */
@Getter
@Setter
@NoArgsConstructor
@JsonTypeName("reservation.expired")
public class ReservationExpiredEvent extends BaseEvent {
    private String holdId;
    private String showId;
    private Set<String> seatIds;
}
