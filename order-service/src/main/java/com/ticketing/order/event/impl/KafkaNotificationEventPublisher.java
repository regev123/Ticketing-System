package com.ticketing.order.event.impl;

import com.ticketing.events.TopicNames;
import com.ticketing.events.notification.NotificationRequestedEvent;
import com.ticketing.order.event.NotificationEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka-backed implementation of NotificationEventPublisher.
 */
@Component
@RequiredArgsConstructor
public class KafkaNotificationEventPublisher implements NotificationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(NotificationRequestedEvent event) {
        kafkaTemplate.send(TopicNames.NOTIFICATION_EVENTS, event);
    }
}
