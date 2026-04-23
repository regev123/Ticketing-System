package com.ticketing.order.dto;

import com.ticketing.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private String id;
    private String holdId;
    private String showId;
    private Set<String> seatIds;
    private String userId;
    private String userEmail;
    private String showTitle;
    private String venueName;
    private String startTime;
    private BigDecimal amount;
    private String currency;
    private OrderStatus status;
    private Instant createdAt;
}
