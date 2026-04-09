package com.ticketing.order.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Clears reservation Redis (hold + seat keys) after order is persisted.
 */
@Component
@Slf4j
public class ReservationHoldClient {

    private final WebClient webClient;

    public ReservationHoldClient(@Value("${reservation.service.url:http://localhost:8083}") String baseUrl) {
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.webClient = WebClient.builder().baseUrl(normalizedBaseUrl).build();
    }

    public void releaseHold(String holdId) {
        try {
            webClient.delete()
                    .uri("/api/reservations/{holdId}", holdId)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, resp -> resp.createException())
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.warn("Could not release hold {} after order: {}", holdId, e.getMessage());
        }
    }
}
