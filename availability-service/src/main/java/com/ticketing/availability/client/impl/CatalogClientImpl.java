package com.ticketing.availability.client.impl;

import com.ticketing.availability.client.CatalogClient;
import com.ticketing.common.constant.HttpStatusCodes;
import com.ticketing.common.contract.catalog.CatalogApiPaths;
import com.ticketing.common.contract.catalog.CatalogShowResponse;
import com.ticketing.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

/**
 * WebClient-based catalog service client.
 * SRP: fetch show data from catalog service.
 * DIP: implements CatalogClient interface.
 */
@Component
public class CatalogClientImpl implements CatalogClient {

    private final WebClient webClient;

    public CatalogClientImpl(@Qualifier("catalogWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Mono<CatalogShowResponse> fetchCatalogShow(String showId) {
        return webClient.get()
                .uri(CatalogApiPaths.SHOW_BY_ID, showId)
                .retrieve()
                .bodyToMono(CatalogShowResponse.class)
                .onErrorResume(WebClientResponseException.class, ex ->
                        ex.getStatusCode().value() == HttpStatusCodes.NOT_FOUND
                                ? Mono.error(new ResourceNotFoundException("Show not found: " + showId))
                                : Mono.error(ex));
    }
}
