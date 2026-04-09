package com.ticketing.reservation.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Tells availability-service to drop cached seat lists when holds change.
 */
@Component
@Slf4j
public class AvailabilityCacheNotifier {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .build();

    @Value("${availability.service.url:http://localhost:8082}")
    private String availabilityBaseUrl;

    public void notifyAvailabilityChanged(String showId) {
        if (showId == null || showId.isBlank()) {
            return;
        }
        try {
            String normalizedBaseUrl = availabilityBaseUrl.endsWith("/")
                    ? availabilityBaseUrl.substring(0, availabilityBaseUrl.length() - 1)
                    : availabilityBaseUrl;
            String url = normalizedBaseUrl
                    + "/api/availability/" + showId + "/cache/evict";
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();
            HttpResponse<Void> res = httpClient.send(req, HttpResponse.BodyHandlers.discarding());
            if (res.statusCode() >= 400) {
                log.warn("Availability cache evict returned HTTP {} for show {}", res.statusCode(), showId);
            }
        } catch (Exception e) {
            log.warn("Failed to evict availability cache for show {}: {}", showId, e.getMessage());
        }
    }
}
