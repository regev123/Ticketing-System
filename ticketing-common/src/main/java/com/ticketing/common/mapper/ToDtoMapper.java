package com.ticketing.common.mapper;

/**
 * Maps an entity to a DTO/Response.
 * Implement when converting a domain entity to API response.
 * SRP: single conversion responsibility.
 *
 * @param <E> source entity type
 * @param <D> target DTO type (e.g. Response, API contract)
 */
@FunctionalInterface
public interface ToDtoMapper<E, D> {

    /**
     * Maps the entity to a DTO.
     */
    D toDto(E entity);
}
