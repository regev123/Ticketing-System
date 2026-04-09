package com.ticketing.availability.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Set;

/**
 * Calls order-service for seats tied to non-cancelled orders.
 */
@Component
public class OrderSeatClient {

    private final WebClient webClient;

    public OrderSeatClient(@Qualifier("orderWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<Set<String>> getUnavailableSeatIdsFromOrders(String showId) {
        return webClient.get()
                .uri("/api/orders/shows/{showId}/unavailable-seat-ids", showId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Set<String>>() {})
                .onErrorResume(ex -> Mono.just(Set.of()));
    }
}
