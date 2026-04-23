package com.ticketing.payment.event.impl;

import com.ticketing.events.TopicNames;
import com.ticketing.events.payment.PaymentFailedEvent;
import com.ticketing.events.payment.PaymentSucceededEvent;
import com.ticketing.payment.event.PaymentEventPublisher;
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
    public void publishSucceeded(PaymentSucceededEvent event) {
        kafkaTemplate.send(TopicNames.PAYMENT_EVENTS, resolveMessageKey(event.getOrderId()), event);
    }

    @Override
    public void publishFailed(PaymentFailedEvent event) {
        kafkaTemplate.send(TopicNames.PAYMENT_EVENTS, resolveMessageKey(event.getOrderId()), event);
    }

    private static String resolveMessageKey(String orderId) {
        if (orderId != null && !orderId.isBlank()) {
            return orderId;
        }
        return java.util.UUID.randomUUID().toString();
    }
}
