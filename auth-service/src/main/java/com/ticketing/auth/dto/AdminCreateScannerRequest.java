package com.ticketing.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminCreateScannerRequest(
        @NotBlank String scannerName,
        @NotBlank String showId,
        @NotBlank String showTitle,
        @NotBlank String eventEndAt
) {
}
