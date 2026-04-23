package com.ticketing.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.common.exception.ConflictException;
import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.HoldSnapshot;
import com.ticketing.order.integration.OrderSeatHoldVerifier;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.eq;

class OrderSeatHoldVerifierTest {

    @Test
    void verifyBeforeOrder_passesWhenSeatAndHoldMatchRedis() throws Exception {
        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> ops = Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(ops);

        ObjectMapper mapper = new ObjectMapper();
        OrderSeatHoldVerifier verifier = new OrderSeatHoldVerifier(redisTemplate, mapper);

        String showId = "show-1";
        String seatId = "seat-A1";
        String holdId = "hold-1";
        String userId = "user-1";

        CreateOrderRequest req = CreateOrderRequest.builder()
                .holdId(holdId)
                .showId(showId)
                .seatIds(Set.of(seatId))
                .amount(BigDecimal.valueOf(50.00))
                .currency("USD")
                .build();

        Mockito.when(ops.get(eq("seat:" + showId + ":" + seatId))).thenReturn(userId);

        HoldSnapshot snapshot = new HoldSnapshot();
        snapshot.setHoldId(holdId);
        snapshot.setShowId(showId);
        snapshot.setSeatIds(Set.of(seatId));
        snapshot.setUserId(userId);
        snapshot.setExpiresAt(System.currentTimeMillis() + 10_000);

        String holdJson = mapper.writeValueAsString(snapshot);
        Mockito.when(ops.get(eq("hold:" + holdId))).thenReturn(holdJson);

        assertDoesNotThrow(() -> verifier.verifyBeforeOrder(req, userId));
    }

    @Test
    void verifyBeforeOrder_throwsWhenSeatOwnedByOtherUser() {
        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> ops = Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(ops);

        ObjectMapper mapper = new ObjectMapper();
        OrderSeatHoldVerifier verifier = new OrderSeatHoldVerifier(redisTemplate, mapper);

        String showId = "show-1";
        String seatId = "seat-A1";
        String holdId = "hold-1";
        String userId = "user-1";

        CreateOrderRequest req = CreateOrderRequest.builder()
                .holdId(holdId)
                .showId(showId)
                .seatIds(Set.of(seatId))
                .amount(BigDecimal.valueOf(50.00))
                .currency("USD")
                .build();

        // Seat value in Redis belongs to another user.
        Mockito.when(ops.get(eq("seat:" + showId + ":" + seatId))).thenReturn("user-2");

        assertThatThrownBy(() -> verifier.verifyBeforeOrder(req, userId))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Seat not held or expired: " + seatId);
    }

    @Test
    void verifyBeforeOrder_throwsWhenHoldJsonMissing() {
        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> ops = Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(ops);

        ObjectMapper mapper = new ObjectMapper();
        OrderSeatHoldVerifier verifier = new OrderSeatHoldVerifier(redisTemplate, mapper);

        String showId = "show-1";
        String seatId = "seat-A1";
        String holdId = "hold-1";
        String userId = "user-1";

        CreateOrderRequest req = CreateOrderRequest.builder()
                .holdId(holdId)
                .showId(showId)
                .seatIds(Set.of(seatId))
                .amount(BigDecimal.valueOf(50.00))
                .currency("USD")
                .build();

        Mockito.when(ops.get(eq("seat:" + showId + ":" + seatId))).thenReturn(userId);
        Mockito.when(ops.get(eq("hold:" + holdId))).thenReturn(null);

        assertThatThrownBy(() -> verifier.verifyBeforeOrder(req, userId))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Hold expired or invalid");
    }

    @Test
    void verifyBeforeOrder_throwsWhenSeatListDoesNotMatchHold() throws Exception {
        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> ops = Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(ops);

        ObjectMapper mapper = new ObjectMapper();
        OrderSeatHoldVerifier verifier = new OrderSeatHoldVerifier(redisTemplate, mapper);

        String showId = "show-1";
        String seatId = "seat-A1";
        String otherSeatId = "seat-A2";
        String holdId = "hold-1";
        String userId = "user-1";

        CreateOrderRequest req = CreateOrderRequest.builder()
                .holdId(holdId)
                .showId(showId)
                .seatIds(Set.of(seatId))
                .amount(BigDecimal.valueOf(50.00))
                .currency("USD")
                .build();

        Mockito.when(ops.get(eq("seat:" + showId + ":" + seatId))).thenReturn(userId);

        HoldSnapshot snapshot = new HoldSnapshot();
        snapshot.setHoldId(holdId);
        snapshot.setShowId(showId);
        snapshot.setSeatIds(Set.of(otherSeatId)); // hold doesn't contain requested seat
        snapshot.setUserId(userId);
        snapshot.setExpiresAt(System.currentTimeMillis() + 10_000);

        String holdJson = mapper.writeValueAsString(snapshot);
        Mockito.when(ops.get(eq("hold:" + holdId))).thenReturn(holdJson);

        assertThatThrownBy(() -> verifier.verifyBeforeOrder(req, userId))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Seat list does not match hold");
    }
}

