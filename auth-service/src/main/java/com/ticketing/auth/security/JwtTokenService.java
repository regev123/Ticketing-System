package com.ticketing.auth.security;

import com.ticketing.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtTokenService {
    private final SecretKey key;
    private final long tokenTtlSeconds;

    public JwtTokenService(
            @Value("${auth.jwt.secret}") String secret,
            @Value("${auth.jwt.ttl-seconds}") long tokenTtlSeconds) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.tokenTtlSeconds = tokenTtlSeconds;
    }

    public String issueToken(User user) {
        Instant now = Instant.now();
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("tokenVersion", user.getTokenVersion());
        if (user.getRole() != null && "SCANNER".equals(user.getRole().name())) {
            if (user.getScannerEventId() != null && !user.getScannerEventId().isBlank()) {
                claims.put("scannerEventId", user.getScannerEventId());
            }
            if (user.getScannerEventEndAt() != null) {
                claims.put("scannerEventEndAt", user.getScannerEventEndAt().toString());
            }
        }
        return Jwts.builder()
                .subject(user.getId())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(tokenTtlSeconds)))
                .claims(claims)
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
