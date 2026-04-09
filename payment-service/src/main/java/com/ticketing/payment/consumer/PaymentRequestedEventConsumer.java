package com.ticketing.payment.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.common.kafka.JsonTypedEventDispatcher;
import com.ticketing.events.TopicNames;
import com.ticketing.events.payment.PaymentRequestedEvent;
import com.ticketing.payment.handler.PaymentRequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Consumes payment.requested from Kafka and delegates to PaymentRequestHandler.
 * SRP: deserialize and route events.
 */
@Component
@RequiredArgsConstructor
public class PaymentRequestedEventConsumer {

    private static final String TYPE_PAYMENT_REQUESTED = "payment.requested";

    private final ObjectMapper objectMapper;
    private final PaymentRequestHandler paymentRequestHandler;

    @KafkaListener(topics = TopicNames.PAYMENT_EVENTS, groupId = "${spring.kafka.consumer.group-id}")
    public void consume(String message, @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        JsonTypedEventDispatcher.dispatch(message, key, objectMapper,
                Map.of(TYPE_PAYMENT_REQUESTED, JsonTypedEventDispatcher.handler(PaymentRequestedEvent.class, paymentRequestHandler::handle)),
                "payment.requested");
    }
}
