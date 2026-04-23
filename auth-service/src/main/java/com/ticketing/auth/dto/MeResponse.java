package com.ticketing.auth.dto;

public record MeResponse(
        String id,
        String email,
        String role,
        boolean active,
        boolean emailVerified,
        String firstName,
        String lastName
) {
}
