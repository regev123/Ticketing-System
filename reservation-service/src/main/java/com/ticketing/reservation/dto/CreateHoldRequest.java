package com.ticketing.reservation.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHoldRequest {

    @NotNull(message = "showId is required")
    private String showId;

    @NotEmpty(message = "seatIds cannot be empty")
    private Set<String> seatIds;

}
