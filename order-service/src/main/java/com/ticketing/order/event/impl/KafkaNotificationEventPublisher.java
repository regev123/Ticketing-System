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
        kafkaTemplate.send(TopicNames.NOTIFICATION_EVENTS, resolveMessageKey(event), event);
    }

    private String resolveMessageKey(NotificationRequestedEvent event) {
        if (event.getOrderId() != null && !event.getOrderId().isBlank()) {
            return event.getOrderId();
        }
        if (event.getUserId() != null && !event.getUserId().isBlank()) {
            return event.getUserId();
        }
        return event.getId();
    }
}
