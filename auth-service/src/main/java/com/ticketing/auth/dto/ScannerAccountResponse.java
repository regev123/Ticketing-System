package com.ticketing.auth.dto;

import java.time.Instant;

public record ScannerAccountResponse(
        String id,
        String email,
        String role,
        boolean active,
        String firstName,
        String lastName,
        String scannerEventId,
        String scannerEventTitle,
        Instant scannerEventEndAt,
        String temporaryPassword,
        Instant createdAt,
        Instant lastLoginAt
) {
}
