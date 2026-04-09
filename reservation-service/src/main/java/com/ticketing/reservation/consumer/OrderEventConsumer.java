package com.ticketing.reservation.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.common.kafka.JsonTypedEventDispatcher;
import com.ticketing.events.TopicNames;
import com.ticketing.events.order.OrderCancelledEvent;
import com.ticketing.events.order.OrderConfirmedEvent;
import com.ticketing.reservation.handler.OrderEventHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Consumes order.confirmed and order.cancelled from Kafka and delegates to OrderEventHandler.
 * SRP: deserialize and route events.
 */
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private static final String TYPE_ORDER_CONFIRMED = "order.confirmed";
    private static final String TYPE_ORDER_CANCELLED = "order.cancelled";

    private final ObjectMapper objectMapper;
    private final OrderEventHandler orderEventHandler;

    @KafkaListener(topics = TopicNames.ORDER_EVENTS, groupId = "${spring.kafka.consumer.group-id}")
    public void consume(String message, @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        JsonTypedEventDispatcher.dispatch(message, key, objectMapper,
                Map.of(
                        TYPE_ORDER_CONFIRMED, JsonTypedEventDispatcher.handler(OrderConfirmedEvent.class, orderEventHandler::handleOrderConfirmed),
                        TYPE_ORDER_CANCELLED, JsonTypedEventDispatcher.handler(OrderCancelledEvent.class, orderEventHandler::handleOrderCancelled)
                ),
                "order");
    }
}
