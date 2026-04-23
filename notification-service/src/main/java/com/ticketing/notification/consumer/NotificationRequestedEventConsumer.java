package com.ticketing.notification.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.common.kafka.JsonTypedEventDispatcher;
import com.ticketing.events.TopicNames;
import com.ticketing.events.notification.NotificationRequestedEvent;
import com.ticketing.notification.handler.NotificationHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Consumes notification.requested from Kafka and delegates to NotificationHandler.
 * SRP: deserialize and route events.
 */
@Component
@RequiredArgsConstructor
public class NotificationRequestedEventConsumer {

    private static final String TYPE_NOTIFICATION_REQUESTED = "notification.requested";

    private final ObjectMapper objectMapper;
    private final NotificationHandler notificationHandler;

    @KafkaListener(topics = TopicNames.NOTIFICATION_EVENTS, groupId = "${spring.kafka.consumer.group-id}")
    public void consume(String message, @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key) {
        JsonTypedEventDispatcher.dispatch(message, key, objectMapper,
                Map.of(TYPE_NOTIFICATION_REQUESTED, JsonTypedEventDispatcher.handler(NotificationRequestedEvent.class, notificationHandler::handle)),
                "notification");
    }
}
