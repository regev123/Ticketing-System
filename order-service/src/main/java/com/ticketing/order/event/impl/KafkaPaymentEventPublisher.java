package com.ticketing.order.event.impl;

import com.ticketing.events.TopicNames;
import com.ticketing.events.payment.PaymentRequestedEvent;
import com.ticketing.order.event.PaymentEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka-backed implementation of PaymentEventPublisher.
 */
@Component
@RequiredArgsConstructor
public class KafkaPaymentEventPublisher implements PaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(PaymentRequestedEvent event) {
        kafkaTemplate.send(TopicNames.PAYMENT_EVENTS, event);
    }
}
