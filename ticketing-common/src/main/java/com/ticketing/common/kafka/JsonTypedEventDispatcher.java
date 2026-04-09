package com.ticketing.common.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.function.Consumer;

/**
 * Shared dispatcher for JSON-typed Kafka events.
 * Extracts "type" field, deserializes to the matching event class, and invokes the handler.
 * Reduces boilerplate across event consumers.
 */
@Slf4j
public final class JsonTypedEventDispatcher {

    private JsonTypedEventDispatcher() {
        throw new UnsupportedOperationException("Utility class - do not instantiate");
    }

    /**
     * Dispatches a JSON message to the matching handler by type field.
     * Logs error and rethrows for Kafka retry.
     *
     * @param message       raw JSON string
     * @param key           Kafka message key (for logging)
     * @param objectMapper  Jackson ObjectMapper
     * @param handlers      map of event type string to handler
     * @param errorContext  context string for error messages (e.g. "payment event")
     */
    public static void dispatch(String message, String key, ObjectMapper objectMapper,
                               Map<String, TypedHandler<?>> handlers,
                               String errorContext) {
        try {
            JsonNode node = objectMapper.readTree(message);
            String type = node.path("type").asText();
            TypedHandler<?> handler = handlers.get(type);
            if (handler != null) {
                handler.process(node, objectMapper);
            }
        } catch (Exception e) {
            log.error("Failed to process {} event key={} message={}", errorContext, key, message, e);
            throw new RuntimeException(errorContext + " processing failed", e);
        }
    }

    /**
     * Creates a TypedHandler for the given event class and consumer.
     */
    public static <E> TypedHandler<E> handler(Class<E> eventClass, Consumer<E> consumer) {
        return new TypedHandler<>() {
            @Override
            public Class<E> getEventClass() {
                return eventClass;
            }

            @Override
            public void handle(E event) {
                consumer.accept(event);
            }
        };
    }

    /**
     * Handler for a specific event type.
     */
    public interface TypedHandler<E> {
        Class<E> getEventClass();

        void handle(E event);

        default void process(JsonNode node, ObjectMapper om) throws Exception {
            E event = om.treeToValue(node, getEventClass());
            handle(event);
        }
    }
}
