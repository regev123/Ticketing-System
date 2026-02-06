package com.ticketing.events.reservation;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.ticketing.events.BaseEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

/** Event emitted when seats are successfully held. */
@Getter
@Setter
@NoArgsConstructor
@JsonTypeName("reservation.created")
public class ReservationCreatedEvent extends BaseEvent {
    private String holdId;
    private String showId;
    private Set<String> seatIds;
    private String userId;
    private long expiresAt;
}
