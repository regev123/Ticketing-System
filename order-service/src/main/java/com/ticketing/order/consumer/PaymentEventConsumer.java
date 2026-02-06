package com.ticketing.order.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.events.payment.PaymentFailedEvent;
import com.ticketing.events.payment.PaymentSucceededEvent;
import com.ticketing.order.handler.PaymentEventHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

/**
 * Consumes payment events from Kafka and delegates to PaymentEventHandler.
 * Single responsibility: deserialize and route events.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private static final String TYPE_PAYMENT_SUCCEEDED = "payment.succeeded";
    private static final String TYPE_PAYMENT_FAILED = "payment.failed";

    private final ObjectMapper objectMapper;
    private final PaymentEventHandler paymentEventHandler;

    @KafkaListener(topics = "payment.events", groupId = "order-service")
    public void consume(String message, @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        try {
            var node = objectMapper.readTree(message);
            String type = node.path("type").asText();

            if (TYPE_PAYMENT_SUCCEEDED.equals(type)) {
                PaymentSucceededEvent event = objectMapper.treeToValue(node, PaymentSucceededEvent.class);
                paymentEventHandler.handlePaymentSucceeded(event);
            } else if (TYPE_PAYMENT_FAILED.equals(type)) {
                PaymentFailedEvent event = objectMapper.treeToValue(node, PaymentFailedEvent.class);
                paymentEventHandler.handlePaymentFailed(event);
            }
        } catch (Exception e) {
            log.error("Failed to process payment event: {}", message, e);
        }
    }
}
