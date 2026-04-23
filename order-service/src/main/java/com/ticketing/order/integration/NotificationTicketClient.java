package com.ticketing.order.integration;

import com.ticketing.order.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@Slf4j
public class NotificationTicketClient {

    private final WebClient webClient;

    public NotificationTicketClient(@Value("${notification.service.url:http://localhost:8085}") String baseUrl) {
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.webClient = WebClient.builder().baseUrl(normalizedBaseUrl).build();
    }

    public byte[] generateTicketPdf(Order order, String seatId) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/notifications/internal/tickets/pdf")
                            .queryParam("orderId", order.getId())
                            .queryParam("seatId", seatId)
                            .queryParam("showId", nullToEmpty(order.getShowId()))
                            .queryParam("showTitle", nullToEmpty(order.getShowTitle()))
                            .queryParam("venueName", nullToEmpty(order.getVenueName()))
                            .queryParam("startTime", nullToEmpty(order.getStartTime()))
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, resp -> resp.createException())
                    .bodyToMono(byte[].class)
                    .block();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate ticket PDF via notification-service", e);
        }
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
