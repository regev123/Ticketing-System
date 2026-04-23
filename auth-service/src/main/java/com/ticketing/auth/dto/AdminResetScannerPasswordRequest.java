package com.ticketing.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminResetScannerPasswordRequest(
        @NotBlank String newPassword
) {
}
