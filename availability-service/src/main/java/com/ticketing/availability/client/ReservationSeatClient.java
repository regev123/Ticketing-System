package com.ticketing.availability.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Set;

/**
 * Calls reservation-service for Redis seat locks (active holds).
 */
@Component
public class ReservationSeatClient {

    private final WebClient webClient;

    public ReservationSeatClient(@Qualifier("reservationWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<Set<String>> getLockedSeatIds(String showId) {
        return webClient.get()
                .uri("/api/reservations/shows/{showId}/locked-seats", showId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Set<String>>() {})
                .onErrorResume(ex -> Mono.just(Set.of()));
    }
}
