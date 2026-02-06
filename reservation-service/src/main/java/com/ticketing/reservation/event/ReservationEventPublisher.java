package com.ticketing.reservation.event;

import com.ticketing.events.reservation.ReservationCreatedEvent;
import com.ticketing.events.reservation.ReservationExpiredEvent;

/**
 * Publishes reservation domain events to Kafka.
 * DIP: services depend on this interface, not the concrete implementation.
 */
public interface ReservationEventPublisher {

    void publishReservationCreated(ReservationCreatedEvent event);

    void publishReservationExpired(ReservationExpiredEvent event);
}
