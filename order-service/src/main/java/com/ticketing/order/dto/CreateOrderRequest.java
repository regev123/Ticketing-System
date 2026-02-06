package com.ticketing.order.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "holdId is required")
    private String holdId;

    @NotNull(message = "showId is required")
    private String showId;

    @NotEmpty(message = "seatIds cannot be empty")
    private Set<String> seatIds;

    @NotNull(message = "userId is required")
    private String userId;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "currency is required")
    private String currency;
}
