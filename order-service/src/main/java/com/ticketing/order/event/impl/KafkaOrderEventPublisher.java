package com.ticketing.order.event.impl;

import com.ticketing.events.TopicNames;
import com.ticketing.events.order.OrderCancelledEvent;
import com.ticketing.events.order.OrderConfirmedEvent;
import com.ticketing.order.event.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka-backed implementation of OrderEventPublisher.
 */
@Component
@RequiredArgsConstructor
public class KafkaOrderEventPublisher implements OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publishOrderConfirmed(OrderConfirmedEvent event) {
        kafkaTemplate.send(TopicNames.ORDER_EVENTS, event);
    }

    @Override
    public void publishOrderCancelled(OrderCancelledEvent event) {
        kafkaTemplate.send(TopicNames.ORDER_EVENTS, event);
    }
}
