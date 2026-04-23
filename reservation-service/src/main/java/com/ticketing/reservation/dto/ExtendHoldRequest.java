package com.ticketing.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtendHoldRequest {

    @NotBlank
    private String holdId;

    @NotBlank
    private String showId;

    @NotEmpty
    private List<String> seats;

    /** Optional override for hold TTL, in seconds (e.g. checkout can set 300 = 5 minutes). */
    @Min(1)
    @Max(420)
    private Integer ttlSeconds;
}
