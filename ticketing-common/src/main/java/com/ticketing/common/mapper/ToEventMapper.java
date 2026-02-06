package com.ticketing.common.mapper;

/**
 * Maps a source (entity/context) to an event for publishing.
 * Implement when converting domain data to Kafka/event payloads.
 * SRP: single conversion responsibility.
 *
 * @param <E> source type (e.g. entity, DTO, or context object)
 * @param <V> target event type
 */
@FunctionalInterface
public interface ToEventMapper<E, V> {

    /**
     * Maps the source to an event.
     */
    V toEvent(E source);
}
