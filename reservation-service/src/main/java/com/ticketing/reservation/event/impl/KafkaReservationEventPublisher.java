package com.ticketing.reservation.event.impl;

import com.ticketing.events.TopicNames;
import com.ticketing.events.reservation.ReservationCreatedEvent;
import com.ticketing.events.reservation.ReservationExpiredEvent;
import com.ticketing.reservation.event.ReservationEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka-backed implementation of ReservationEventPublisher.
 */
@Component
@RequiredArgsConstructor
public class KafkaReservationEventPublisher implements ReservationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publishReservationCreated(ReservationCreatedEvent event) {
        kafkaTemplate.send(TopicNames.RESERVATION_EVENTS, event);
    }

    @Override
    public void publishReservationExpired(ReservationExpiredEvent event) {
        kafkaTemplate.send(TopicNames.RESERVATION_EVENTS, event);
    }
}
