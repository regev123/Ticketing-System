package com.ticketing.order.event.impl;

import com.ticketing.events.TopicNames;
import com.ticketing.events.payment.PaymentRequestedEvent;
import com.ticketing.order.event.PaymentEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka-backed implementation of PaymentEventPublisher.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaPaymentEventPublisher implements PaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(PaymentRequestedEvent event) {
        kafkaTemplate.send(TopicNames.PAYMENT_EVENTS, event);
        log.info("Published payment.requested: orderId={}, paymentId={}", event.getOrderId(), event.getPaymentId());
    }
}
