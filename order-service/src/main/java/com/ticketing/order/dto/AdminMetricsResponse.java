package com.ticketing.order.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;

@Value
@Builder
public class AdminMetricsResponse {
    int windowDays;
    GlobalMetrics global;
    List<EventMetrics> perEventMetrics;
    List<EventMetrics> topEventsByRevenue;

    @Value
    @Builder
    public static class GlobalMetrics {
        long totalOrders;
        long confirmedOrders;
        long pendingOrders;
        long cancelledOrders;
        long partiallyCancelledOrders;
        long ticketsActive;
        long scansSuccessful;
        BigDecimal revenueConfirmed;
        BigDecimal revenueEstimated;
    }

    @Value
    @Builder
    public static class EventMetrics {
        String showId;
        String showTitle;
        long totalOrders;
        long confirmedOrders;
        long pendingOrders;
        long cancelledOrders;
        long partiallyCancelledOrders;
        long activeTickets;
        long scansSuccessful;
        BigDecimal revenueEstimated;
        BigDecimal revenue;
    }
}
