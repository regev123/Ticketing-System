package com.ticketing.availability.client.impl;

import com.ticketing.availability.client.CatalogClient;
import com.ticketing.availability.entity.SeatAvailability;
import com.ticketing.availability.mapper.SeatAvailabilityMapper;
import com.ticketing.common.constant.HttpStatusCodes;
import com.ticketing.common.contract.catalog.CatalogApiPaths;
import com.ticketing.common.contract.catalog.CatalogShowResponse;
import com.ticketing.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

/**
 * WebClient-based catalog service client.
 * SRP: fetch show data from catalog and map to SeatAvailability.
 * DIP: implements CatalogClient interface.
 */
@Component
@RequiredArgsConstructor
public class CatalogClientImpl implements CatalogClient {

    private final WebClient webClient;
    private final SeatAvailabilityMapper mapper;

    @Override
    public Mono<SeatAvailability> getShowAvailability(String showId) {
        return webClient.get()
                .uri(CatalogApiPaths.SHOW_BY_ID, showId)
                .retrieve()
                .bodyToMono(CatalogShowResponse.class)
                .map(mapper::toEntity)
                .onErrorResume(WebClientResponseException.class, ex ->
                        ex.getStatusCode().value() == HttpStatusCodes.NOT_FOUND
                                ? Mono.error(new ResourceNotFoundException("Show not found: " + showId))
                                : Mono.error(ex));
    }
}
