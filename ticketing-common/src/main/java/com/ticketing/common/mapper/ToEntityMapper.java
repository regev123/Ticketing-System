package com.ticketing.common.mapper;

/**
 * Maps a source (DTO/Request) to an entity.
 * Implement when converting input data to a domain entity.
 * SRP: single conversion responsibility.
 *
 * @param <T> source type (e.g. CreateRequest, external DTO)
 * @param <E> target entity type
 */
@FunctionalInterface
public interface ToEntityMapper<T, E> {

    /**
     * Maps the source to an entity.
     */
    E toEntity(T source);
}
