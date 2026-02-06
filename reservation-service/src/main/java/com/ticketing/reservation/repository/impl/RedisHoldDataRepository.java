package com.ticketing.reservation.repository.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.common.exception.ConflictException;
import com.ticketing.reservation.constant.RedisKeys;
import com.ticketing.reservation.entity.HoldData;
import com.ticketing.reservation.repository.HoldDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Redis-backed implementation of HoldDataRepository.
 */
@Repository
@RequiredArgsConstructor
public class RedisHoldDataRepository implements HoldDataRepository {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public Set<String> acquireSeatLocks(String showId, Set<String> seatIds, String holdId) {
        Set<String> lockedSeats = new HashSet<>();
        try {
            for (String seatId : seatIds) {
                String key = RedisKeys.seatLockKey(showId, seatId);
                Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, holdId,
                        java.time.Duration.ofMillis(RedisKeys.HOLD_TTL_MS));
                if (Boolean.FALSE.equals(acquired)) {
                    throw new ConflictException("Seat already held: " + seatId);
                }
                lockedSeats.add(seatId);
            }
            return lockedSeats;
        } catch (ConflictException e) {
            deleteSeatLocks(showId, lockedSeats);
            throw e;
        }
    }

    @Override
    public void save(HoldData holdData) {
        String holdKey = RedisKeys.holdKey(holdData.getHoldId());
        redisTemplate.opsForValue().set(holdKey, toJson(holdData),
                java.time.Duration.ofMillis(RedisKeys.HOLD_TTL_MS));
    }

    @Override
    public void saveHoldMeta(String holdId, String showId, Set<String> seatIds) {
        String metaKey = RedisKeys.holdMetaKey(holdId);
        redisTemplate.opsForValue().set(metaKey, toHoldMetaJson(showId, seatIds),
                java.time.Duration.ofMillis(RedisKeys.HOLD_META_TTL_MS));
    }

    @Override
    public HoldData findById(String holdId) {
        String json = redisTemplate.opsForValue().get(RedisKeys.holdKey(holdId));
        return json != null ? fromJson(json) : null;
    }

    @Override
    public HoldMeta findHoldMeta(String holdId) {
        String metaKey = RedisKeys.holdMetaKey(holdId);
        String metaJson = redisTemplate.opsForValue().get(metaKey);
        if (metaJson == null) {
            return null;
        }
        try {
            Map<String, Object> meta = objectMapper.readValue(metaJson,
                    new TypeReference<Map<String, Object>>() {});
            String showId = (String) meta.get("showId");
            var seatIdsObj = meta.get("seatIds");
            Set<String> seatIds = seatIdsObj instanceof List<?> list
                    ? Set.copyOf(list.stream().map(Object::toString).toList())
                    : Set.<String>of();
            return new HoldMeta(holdId, showId, seatIds);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public void delete(String holdId, String showId, Set<String> seatIds) {
        deleteSeatLocks(showId, seatIds);
        redisTemplate.delete(RedisKeys.holdKey(holdId));
        deleteHoldMeta(holdId);
    }

    @Override
    public void deleteSeatLocks(String showId, Set<String> seatIds) {
        for (String seatId : seatIds) {
            redisTemplate.delete(RedisKeys.seatLockKey(showId, seatId));
        }
    }

    @Override
    public void deleteHoldMeta(String holdId) {
        redisTemplate.delete(RedisKeys.holdMetaKey(holdId));
    }

    private String toJson(HoldData data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize HoldData", e);
        }
    }

    private String toHoldMetaJson(String showId, Set<String> seatIds) {
        try {
            return objectMapper.writeValueAsString(Map.of("showId", showId, "seatIds", seatIds));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize hold metadata", e);
        }
    }

    private HoldData fromJson(String json) {
        try {
            return objectMapper.readValue(json, HoldData.class);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to deserialize HoldData", e);
        }
    }
}
