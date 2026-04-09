package com.ticketing.order.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.common.kafka.JsonTypedEventDispatcher;
import com.ticketing.events.TopicNames;
import com.ticketing.events.payment.PaymentFailedEvent;
import com.ticketing.events.payment.PaymentSucceededEvent;
import com.ticketing.order.handler.PaymentEventHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Consumes payment events from Kafka and delegates to PaymentEventHandler.
 * SRP: deserialize and route events.
 */
@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private static final String TYPE_PAYMENT_SUCCEEDED = "payment.succeeded";
    private static final String TYPE_PAYMENT_FAILED = "payment.failed";

    private final ObjectMapper objectMapper;
    private final PaymentEventHandler paymentEventHandler;

    @KafkaListener(topics = TopicNames.PAYMENT_EVENTS, groupId = "${spring.kafka.consumer.group-id}")
    public void consume(String message, @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        JsonTypedEventDispatcher.dispatch(message, key, objectMapper,
                Map.of(
                        TYPE_PAYMENT_SUCCEEDED, JsonTypedEventDispatcher.handler(PaymentSucceededEvent.class, paymentEventHandler::handlePaymentSucceeded),
                        TYPE_PAYMENT_FAILED, JsonTypedEventDispatcher.handler(PaymentFailedEvent.class, paymentEventHandler::handlePaymentFailed)
                ),
                "payment");
    }
}
