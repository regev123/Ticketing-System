package com.ticketing.reservation.repository.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.common.exception.ConflictException;
import com.ticketing.reservation.constant.RedisKeys;
import com.ticketing.reservation.entity.HoldData;
import com.ticketing.reservation.repository.HoldDataRepository;
import com.ticketing.reservation.repository.HoldMeta;
import com.ticketing.reservation.repository.SeatBatchResult;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Redis: seat:{showId}:{seatId} -> userId, TTL 420s.
 */
@Repository
@RequiredArgsConstructor
public class RedisHoldDataRepository implements HoldDataRepository {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public Set<String> acquireSeatLocks(String showId, Set<String> seatIds, String userId) {
        Set<String> newlyCreated = new LinkedHashSet<>();
        try {
            for (String seatId : seatIds) {
                String key = RedisKeys.userSeatKey(showId, seatId);
                Boolean ok = redisTemplate.opsForValue().setIfAbsent(key, userId,
                        Duration.ofSeconds(RedisKeys.SEAT_HOLD_TTL_SECONDS));
                if (Boolean.TRUE.equals(ok)) {
                    newlyCreated.add(seatId);
                } else {
                    String v = redisTemplate.opsForValue().get(key);
                    if (!userId.equals(v)) {
                        throw new ConflictException("Seat already held: " + seatId);
                    }
                }
            }
            return seatIds;
        } catch (ConflictException e) {
            for (String seatId : newlyCreated) {
                redisTemplate.delete(RedisKeys.userSeatKey(showId, seatId));
            }
            throw e;
        }
    }

    @Override
    public SeatBatchResult tryAcquireSeatsPartial(String showId, Set<String> seatIds, String userId) {
        Set<String> success = new LinkedHashSet<>();
        Set<String> failed = new LinkedHashSet<>();
        for (String seatId : seatIds) {
            String key = RedisKeys.userSeatKey(showId, seatId);
            Boolean ok = redisTemplate.opsForValue().setIfAbsent(key, userId,
                    Duration.ofSeconds(RedisKeys.SEAT_HOLD_TTL_SECONDS));
            if (Boolean.TRUE.equals(ok)) {
                success.add(seatId);
            } else {
                String v = redisTemplate.opsForValue().get(key);
                if (userId.equals(v)) {
                    success.add(seatId);
                } else {
                    failed.add(seatId);
                }
            }
        }
        return new SeatBatchResult(success, failed);
    }

    @Override
    public void save(HoldData holdData) {
        String holdKey = RedisKeys.holdKey(holdData.getHoldId());
        redisTemplate.opsForValue().set(holdKey, toJson(holdData),
                Duration.ofMillis(RedisKeys.HOLD_TTL_MS));
    }

    @Override
    public void saveHoldMeta(String holdId, String showId, Set<String> seatIds) {
        String metaKey = RedisKeys.holdMetaKey(holdId);
        redisTemplate.opsForValue().set(metaKey, toHoldMetaJson(showId, seatIds),
                Duration.ofMillis(RedisKeys.HOLD_META_TTL_MS));
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
            redisTemplate.delete(RedisKeys.userSeatKey(showId, seatId));
        }
    }

    @Override
    public void deleteHoldMeta(String holdId) {
        redisTemplate.delete(RedisKeys.holdMetaKey(holdId));
    }

    @Override
    public Set<String> findLockedSeatIdsForShow(String showId) {
        String pattern = RedisKeys.SEAT_KEY_PREFIX + showId + RedisKeys.KEY_DELIMITER + "*";
        Set<String> redisKeys = redisTemplate.keys(pattern);
        if (redisKeys == null || redisKeys.isEmpty()) {
            return Set.of();
        }
        String prefix = RedisKeys.SEAT_KEY_PREFIX + showId + RedisKeys.KEY_DELIMITER;
        Set<String> seatIds = new HashSet<>();
        for (String key : redisKeys) {
            if (key.startsWith(prefix)) {
                seatIds.add(key.substring(prefix.length()));
            }
        }
        return seatIds;
    }

    @Override
    public Set<String> releaseSeatsIfOwned(String showId, Set<String> seatIds, String userId) {
        Set<String> released = new LinkedHashSet<>();
        for (String seatId : seatIds) {
            String key = RedisKeys.userSeatKey(showId, seatId);
            String v = redisTemplate.opsForValue().get(key);
            if (userId.equals(v)) {
                redisTemplate.delete(key);
                released.add(seatId);
            }
        }
        return released;
    }

    @Override
    public int extendSeatsTtlIfOwned(String showId, Set<String> seatIds, String userId) {
        int n = 0;
        Duration ttl = Duration.ofSeconds(RedisKeys.SEAT_HOLD_TTL_SECONDS);
        for (String seatId : seatIds) {
            String key = RedisKeys.userSeatKey(showId, seatId);
            String v = redisTemplate.opsForValue().get(key);
            if (userId.equals(v)) {
                redisTemplate.expire(key, ttl);
                n++;
            }
        }
        return n;
    }

    @Override
    public String getActiveHoldId(String showId, String userId) {
        return redisTemplate.opsForValue().get(RedisKeys.userActiveHoldKey(showId, userId));
    }

    @Override
    public void setActiveHoldId(String showId, String userId, String holdId) {
        redisTemplate.opsForValue().set(
                RedisKeys.userActiveHoldKey(showId, userId),
                holdId,
                Duration.ofMillis(RedisKeys.HOLD_META_TTL_MS));
    }

    @Override
    public void deleteActiveHoldId(String showId, String userId) {
        redisTemplate.delete(RedisKeys.userActiveHoldKey(showId, userId));
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
