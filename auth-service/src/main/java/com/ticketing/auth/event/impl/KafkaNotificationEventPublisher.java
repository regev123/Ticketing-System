package com.ticketing.auth.event.impl;

import com.ticketing.auth.event.NotificationEventPublisher;
import com.ticketing.events.TopicNames;
import com.ticketing.events.notification.NotificationRequestedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KafkaNotificationEventPublisher implements NotificationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(NotificationRequestedEvent event) {
        kafkaTemplate.send(TopicNames.NOTIFICATION_EVENTS, resolveMessageKey(event), event);
    }

    private String resolveMessageKey(NotificationRequestedEvent event) {
        if (event.getUserId() != null && !event.getUserId().isBlank()) {
            return event.getUserId();
        }
        if (event.getEmail() != null && !event.getEmail().isBlank()) {
            return event.getEmail();
        }
        return event.getId();
    }
}
