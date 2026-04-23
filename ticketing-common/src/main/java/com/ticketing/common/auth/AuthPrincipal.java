package com.ticketing.common.auth;

public record AuthPrincipal(
        String userId,
        String role,
        int tokenVersion,
        String scannerEventId,
        String scannerEventEndAt
) {
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    public boolean isScanner() {
        return "SCANNER".equals(role);
    }
}
