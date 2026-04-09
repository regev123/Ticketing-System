package com.ticketing.order.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.common.exception.ConflictException;
import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.HoldSnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Verifies Redis seat:{showId}:{seatId} -> userId and hold:{holdId} JSON before committing order.
 */
@Component
@RequiredArgsConstructor
public class OrderSeatHoldVerifier {

    private static final String SEAT_PREFIX = "seat:";
    private static final String HOLD_PREFIX = "hold:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public void verifyBeforeOrder(CreateOrderRequest request) {
        String showId = request.getShowId();
        String userId = request.getUserId();
        for (String seatId : request.getSeatIds()) {
            String key = SEAT_PREFIX + showId + ":" + seatId;
            String v = redisTemplate.opsForValue().get(key);
            if (!userId.equals(v)) {
                throw new ConflictException("Seat not held or expired: " + seatId);
            }
        }
        String holdJson = redisTemplate.opsForValue().get(HOLD_PREFIX + request.getHoldId());
        if (holdJson == null) {
            throw new ConflictException("Hold expired or invalid");
        }
        try {
            HoldSnapshot hold = objectMapper.readValue(holdJson, HoldSnapshot.class);
            if (!userId.equals(hold.getUserId()) || !showId.equals(hold.getShowId())) {
                throw new ConflictException("Hold does not match order");
            }
            if (!hold.getSeatIds().containsAll(request.getSeatIds())
                    || !request.getSeatIds().containsAll(hold.getSeatIds())) {
                throw new ConflictException("Seat list does not match hold");
            }
        } catch (ConflictException e) {
            throw e;
        } catch (Exception e) {
            throw new ConflictException("Hold validation failed");
        }
    }
}
