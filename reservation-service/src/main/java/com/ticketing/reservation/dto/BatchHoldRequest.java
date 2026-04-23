package com.ticketing.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchHoldRequest {

    @NotBlank
    private String showId;

    @NotEmpty
    private List<String> seats;

    /** Optional — merge into existing hold when adding seats incrementally */
    private String holdId;
}
