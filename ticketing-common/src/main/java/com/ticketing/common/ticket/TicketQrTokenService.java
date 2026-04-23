package com.ticketing.common.ticket;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class TicketQrTokenService {

    private static final String CLAIM_SEAT_ID = "seatId";
    private static final String CLAIM_SHOW_ID = "showId";
    private static final String CLAIM_TYPE = "type";
    private static final String TOKEN_TYPE = "ticket_qr";

    private final SecretKey key;
    private final int ttlHours;

    public TicketQrTokenService(
            @Value("${ticket.qr.secret:${TICKET_QR_SECRET:${JWT_SECRET:dev-secret-change-this-key-dev-secret-change-this-key}}}") String secret,
            @Value("${ticket.qr.ttl-hours:${TICKET_QR_TTL_HOURS:48}}") int ttlHours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttlHours = Math.max(ttlHours, 1);
    }

    public String issueToken(String orderId, String seatId, String showId) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(ttlHours, ChronoUnit.HOURS);
        return Jwts.builder()
                .subject(orderId)
                .claim(CLAIM_TYPE, TOKEN_TYPE)
                .claim(CLAIM_SEAT_ID, seatId)
                .claim(CLAIM_SHOW_ID, showId)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key)
                .compact();
    }

    public TicketQrClaims parseAndValidate(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        String type = String.valueOf(claims.get(CLAIM_TYPE));
        if (!TOKEN_TYPE.equals(type)) {
            throw new IllegalArgumentException("Invalid QR token type");
        }
        String orderId = claims.getSubject();
        String seatId = String.valueOf(claims.get(CLAIM_SEAT_ID));
        String showId = claims.get(CLAIM_SHOW_ID) == null ? "" : String.valueOf(claims.get(CLAIM_SHOW_ID));
        return new TicketQrClaims(orderId, seatId, showId);
    }

    public record TicketQrClaims(String orderId, String seatId, String showId) {
    }
}
