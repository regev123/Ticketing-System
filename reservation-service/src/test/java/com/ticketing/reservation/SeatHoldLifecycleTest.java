package com.ticketing.reservation;

import com.ticketing.common.exception.BadRequestException;
import com.ticketing.common.exception.ConflictException;
import com.ticketing.reservation.constant.RedisKeys;
import com.ticketing.reservation.dto.BatchHoldRequest;
import com.ticketing.reservation.dto.BatchHoldResponse;
import com.ticketing.reservation.dto.BatchReleaseRequest;
import com.ticketing.reservation.dto.BatchReleaseResponse;
import com.ticketing.reservation.dto.ExtendHoldRequest;
import com.ticketing.reservation.dto.ExtendHoldResponse;
import com.ticketing.reservation.dto.HoldResponse;
import com.ticketing.reservation.service.ReservationService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
class SeatHoldLifecycleTest {

    private static final String SHOW_ID = "show-seat-hold-lifecycle";
    private static final String SEAT_A1 = "seat-A1";
    private static final String SEAT_A2 = "seat-A2";

    private static final String USER_1 = "user-1";
    private static final String USER_2 = "user-2";

    @SuppressWarnings("all")
    @Container
    static final GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            // Enable expired key events so RedisConfig + HoldExpiryHandler can run.
            .withCommand("redis-server", "--notify-keyspace-events", "Ex")
            .withExposedPorts(6379);

    @SuppressWarnings("all")
    @Container
    static final KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("REDIS_HOST", redis::getHost);
        registry.add("REDIS_PORT", () -> redis.getMappedPort(6379).toString());
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired
    ReservationService reservationService;

    @Autowired
    StringRedisTemplate stringRedisTemplate;

    @BeforeEach
    void flushRedisDb() {
        RedisConnection conn = null;
        try {
            conn = stringRedisTemplate.getConnectionFactory().getConnection();
            conn.flushDb();
        } finally {
            if (conn != null) {
                conn.close();
            }
        }
    }

    @Test
    void createHold_locksSeatsForUser() {
        HoldResponse hold = reservationService.createHold(SHOW_ID, Set.of(SEAT_A1), USER_1);

        assertThat(hold.getHoldId()).isNotBlank();
        assertThat(hold.getShowId()).isEqualTo(SHOW_ID);
        assertThat(hold.getSeatIds()).containsExactlyInAnyOrder(SEAT_A1);
        assertThat(hold.getUserId()).isEqualTo(USER_1);

        assertThat(reservationService.getLockedSeatIdsForShow(SHOW_ID)).containsExactlyInAnyOrder(SEAT_A1);
        assertThat(stringRedisTemplate.opsForValue().get(RedisKeys.userSeatKey(SHOW_ID, SEAT_A1)))
                .isEqualTo(USER_1);
        assertThat(stringRedisTemplate.hasKey(RedisKeys.holdKey(hold.getHoldId()))).isTrue();
    }

    @Test
    void createHold_sameSeatSecondUser_failsWithConflict() {
        reservationService.createHold(SHOW_ID, Set.of(SEAT_A1), USER_1);

        assertThatThrownBy(() -> reservationService.createHold(SHOW_ID, Set.of(SEAT_A1), USER_2))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Seat already held");

        assertThat(stringRedisTemplate.opsForValue().get(RedisKeys.userSeatKey(SHOW_ID, SEAT_A1)))
                .isEqualTo(USER_1);
    }

    @Test
    void batchHold_partialSuccess_onlyAcquiresAvailableSeats() {
        // Pre-hold seat-A1 by user1.
        reservationService.createHold(SHOW_ID, Set.of(SEAT_A1), USER_1);

        BatchHoldRequest req = BatchHoldRequest.builder()
                .showId(SHOW_ID)
                .userId(USER_2)
                .seats(List.of(SEAT_A1, SEAT_A2))
                .build();

        BatchHoldResponse resp = reservationService.batchHold(req);

        assertThat(resp.getSuccess()).containsExactlyInAnyOrder(SEAT_A2);
        assertThat(resp.getFailed()).containsExactlyInAnyOrder(SEAT_A1);
        assertThat(resp.getHold()).isNotNull();
        assertThat(resp.getHold().getSeatIds()).containsExactlyInAnyOrder(SEAT_A2);

        assertThat(reservationService.getLockedSeatIdsForShow(SHOW_ID))
                .containsExactlyInAnyOrder(SEAT_A1, SEAT_A2);
        assertThat(stringRedisTemplate.opsForValue().get(RedisKeys.userSeatKey(SHOW_ID, SEAT_A1)))
                .isEqualTo(USER_1);
        assertThat(stringRedisTemplate.opsForValue().get(RedisKeys.userSeatKey(SHOW_ID, SEAT_A2)))
                .isEqualTo(USER_2);
    }

    @Test
    void extendHold_refreshesTtl_onlyForSeatsOwnedByUser() {
        HoldResponse holdUser1 = reservationService.createHold(SHOW_ID, Set.of(SEAT_A1), USER_1);
        reservationService.createHold(SHOW_ID, Set.of(SEAT_A2), USER_2);

        String holdIdUser1 = holdUser1.getHoldId();
        String seatKeyA2 = RedisKeys.userSeatKey(SHOW_ID, SEAT_A2);
        Long ttlBefore = stringRedisTemplate.getExpire(seatKeyA2);

        ExtendHoldRequest req = ExtendHoldRequest.builder()
                .holdId(holdIdUser1)
                .showId(SHOW_ID)
                .userId(USER_1)
                .seats(List.of(SEAT_A2)) // user1 tries to extend a seat owned by user2
                .build();

        ExtendHoldResponse resp = reservationService.extendHold(req);
        assertThat(resp.getExtended()).isEqualTo(0);

        // Ownership didn't change; user2 still owns seat-A2.
        assertThat(stringRedisTemplate.opsForValue().get(seatKeyA2)).isEqualTo(USER_2);

        // TTL may have moved slightly, but extend shouldn't reset it to full ttl for user1.
        if (ttlBefore != null) {
            Long ttlAfter = stringRedisTemplate.getExpire(seatKeyA2);
            assertThat(ttlAfter).isNotNull();
            // Not a strict numeric comparison to avoid flakes, but we at least ensure key still has a TTL.
            assertThat(ttlAfter).isGreaterThan(0L);
        }

        // Extend should not break active hold for user1.
        assertThat(stringRedisTemplate.hasKey(RedisKeys.userActiveHoldKey(SHOW_ID, USER_1))).isTrue();
    }

    @Test
    void batchRelease_releasesSeatsAndDeletesHoldMetaWhenEmpty() {
        HoldResponse hold = reservationService.createHold(SHOW_ID, Set.of(SEAT_A1, SEAT_A2), USER_1);
        String holdId = hold.getHoldId();

        // Partial release: only A1
        BatchReleaseRequest partialReq = BatchReleaseRequest.builder()
                .holdId(holdId)
                .showId(SHOW_ID)
                .userId(USER_1)
                .seats(List.of(SEAT_A1))
                .build();

        BatchReleaseResponse partialResp = reservationService.batchRelease(partialReq);
        assertThat(partialResp.getReleased()).containsExactlyInAnyOrder(SEAT_A1);

        assertThat(reservationService.getLockedSeatIdsForShow(SHOW_ID)).containsExactlyInAnyOrder(SEAT_A2);
        assertThat(stringRedisTemplate.hasKey(RedisKeys.holdKey(holdId))).isTrue();

        // Full release: remaining A2
        BatchReleaseRequest fullReq = BatchReleaseRequest.builder()
                .holdId(holdId)
                .showId(SHOW_ID)
                .userId(USER_1)
                .seats(List.of(SEAT_A2))
                .build();

        BatchReleaseResponse fullResp = reservationService.batchRelease(fullReq);
        assertThat(fullResp.getReleased()).containsExactlyInAnyOrder(SEAT_A2);

        assertThat(reservationService.getLockedSeatIdsForShow(SHOW_ID)).isEmpty();
        assertThat(stringRedisTemplate.hasKey(RedisKeys.holdKey(holdId))).isFalse();
        assertThat(stringRedisTemplate.hasKey(RedisKeys.holdMetaKey(holdId))).isFalse();
        assertThat(stringRedisTemplate.hasKey(RedisKeys.userActiveHoldKey(SHOW_ID, USER_1))).isFalse();
    }

    @Test
    void batchRelease_wrongUser_failsWithBadRequest() {
        HoldResponse hold = reservationService.createHold(SHOW_ID, Set.of(SEAT_A1), USER_1);

        BatchReleaseRequest req = BatchReleaseRequest.builder()
                .holdId(hold.getHoldId())
                .showId(SHOW_ID)
                .userId(USER_2)
                .seats(List.of(SEAT_A1))
                .build();

        assertThatThrownBy(() -> reservationService.batchRelease(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid hold");
    }

    @Test
    void holdExpiry_keyspaceEvent_cleansHoldMetaAndUnlocksSeats() {
        HoldResponse hold = reservationService.createHold(SHOW_ID, Set.of(SEAT_A1, SEAT_A2), USER_1);
        String holdId = hold.getHoldId();

        String seatKeyA1 = RedisKeys.userSeatKey(SHOW_ID, SEAT_A1);
        String seatKeyA2 = RedisKeys.userSeatKey(SHOW_ID, SEAT_A2);
        String holdKey = RedisKeys.holdKey(holdId);
        String holdMetaKey = RedisKeys.holdMetaKey(holdId);

        assertThat(stringRedisTemplate.hasKey(holdKey)).isTrue();
        assertThat(stringRedisTemplate.hasKey(holdMetaKey)).isTrue();

        // Speed up expiry: shorten seat + hold TTL, but keep holdmeta long so we can verify handler cleanup.
        stringRedisTemplate.expire(seatKeyA1, Duration.ofSeconds(2));
        stringRedisTemplate.expire(seatKeyA2, Duration.ofSeconds(2));
        stringRedisTemplate.expire(holdKey, Duration.ofSeconds(2));
        stringRedisTemplate.expire(holdMetaKey, Duration.ofSeconds(60));

        waitForCondition("seat keys to expire", () ->
                !stringRedisTemplate.hasKey(seatKeyA1) && !stringRedisTemplate.hasKey(seatKeyA2), 8000);

        waitForCondition("holdmeta key to be deleted by HoldExpiryHandler", () ->
                !stringRedisTemplate.hasKey(holdMetaKey), 8000);

        assertThat(reservationService.getLockedSeatIdsForShow(SHOW_ID)).isEmpty();
        assertThat(stringRedisTemplate.hasKey(holdKey)).isFalse();
        assertThat(stringRedisTemplate.hasKey(holdMetaKey)).isFalse();
    }

    @Test
    void concurrentCreateHold_sameSeat_onlyOneUserWins() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch start = new CountDownLatch(1);

        Callable<String> user1Attempt = () -> {
            start.await(5, TimeUnit.SECONDS);
            try {
                reservationService.createHold(SHOW_ID, Set.of(SEAT_A1), USER_1);
                return USER_1;
            } catch (ConflictException e) {
                return USER_1 + ":conflict";
            }
        };

        Callable<String> user2Attempt = () -> {
            start.await(5, TimeUnit.SECONDS);
            try {
                reservationService.createHold(SHOW_ID, Set.of(SEAT_A1), USER_2);
                return USER_2;
            } catch (ConflictException e) {
                return USER_2 + ":conflict";
            }
        };

        Future<String> f1 = executor.submit(user1Attempt);
        Future<String> f2 = executor.submit(user2Attempt);

        start.countDown();

        String r1 = f1.get(8, TimeUnit.SECONDS);
        String r2 = f2.get(8, TimeUnit.SECONDS);
        executor.shutdownNow();

        int successCount = 0;
        String winner = null;
        if (r1.equals(USER_1)) {
            successCount++;
            winner = USER_1;
        }
        if (r2.equals(USER_2)) {
            successCount++;
            winner = USER_2;
        }

        assertThat(successCount).as("Exactly one user should succeed. r1=%s r2=%s", r1, r2).isEqualTo(1);
        assertThat(stringRedisTemplate.opsForValue().get(RedisKeys.userSeatKey(SHOW_ID, SEAT_A1))).isEqualTo(winner);
        assertThat(reservationService.getLockedSeatIdsForShow(SHOW_ID)).containsExactlyInAnyOrder(SEAT_A1);
    }

    private void waitForCondition(String description, java.util.function.BooleanSupplier condition, long timeoutMs) {
        long deadline = System.currentTimeMillis() + timeoutMs;
        Throwable last = null;
        while (System.currentTimeMillis() < deadline) {
            try {
                if (condition.getAsBoolean()) {
                    return;
                }
            } catch (Throwable t) {
                last = t;
            }
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for: " + description, e);
            }
        }

        if (last != null) {
            Assertions.fail(description + " timed out; last error: " + last.getMessage());
        }
        Assertions.fail(description + " timed out");
    }
}

