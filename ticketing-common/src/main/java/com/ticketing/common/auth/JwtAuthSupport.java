package com.ticketing.common.auth;

import com.ticketing.common.exception.ForbiddenException;
import com.ticketing.common.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthSupport {
    private final SecretKey key;

    public JwtAuthSupport(@Value("${auth.jwt.secret:${JWT_SECRET:dev-secret-change-this-key-dev-secret-change-this-key}}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public AuthPrincipal requireAccessToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing bearer token");
        }
        String token = authorizationHeader.substring("Bearer ".length());
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        Object typeRaw = claims.get("type");
        if (typeRaw != null && !"access".equals(String.valueOf(typeRaw))) {
            throw new UnauthorizedException("Invalid access token");
        }
        String userId = claims.getSubject();
        String role = String.valueOf(claims.get("role"));
        Object tokenVersionRaw = claims.get("tokenVersion");
        int tokenVersion = tokenVersionRaw instanceof Number n ? n.intValue() : 0;
        String scannerEventId = claims.get("scannerEventId") == null ? null : String.valueOf(claims.get("scannerEventId"));
        String scannerEventEndAt = claims.get("scannerEventEndAt") == null ? null : String.valueOf(claims.get("scannerEventEndAt"));
        if (userId == null || userId.isBlank()) {
            throw new UnauthorizedException("Invalid token subject");
        }
        return new AuthPrincipal(userId, role, tokenVersion, scannerEventId, scannerEventEndAt);
    }

    public AuthPrincipal requireAdmin(String authorizationHeader) {
        AuthPrincipal principal = requireAccessToken(authorizationHeader);
        if (!principal.isAdmin()) {
            throw new ForbiddenException("Admin role is required");
        }
        return principal;
    }

    public AuthPrincipal requireScannerOrAdmin(String authorizationHeader) {
        AuthPrincipal principal = requireAccessToken(authorizationHeader);
        if (!principal.isScanner() && !principal.isAdmin()) {
            throw new ForbiddenException("Scanner or admin role is required");
        }
        return principal;
    }
}
