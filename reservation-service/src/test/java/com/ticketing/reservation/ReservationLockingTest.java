package com.ticketing.reservation;

import com.ticketing.common.exception.ConflictException;
import com.ticketing.reservation.dto.HoldResponse;
import com.ticketing.reservation.service.ReservationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Testcontainers-based integration tests for reservation locking (anti-double-booking).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
class ReservationLockingTest {

    private static final String SHOW_ID = "show-1";
    private static final String SEAT_ID = "seat-A1";
    private static final Set<String> SEAT_IDS = Set.of(SEAT_ID);

    @SuppressWarnings("all")
    @Container
    static final GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
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

    @Test
    void firstHoldSucceeds() {
        HoldResponse hold = reservationService.createHold(SHOW_ID, SEAT_IDS, "user-1");
        assertThat(hold).isNotNull();
        assertThat(hold.getHoldId()).isNotBlank();
        assertThat(hold.getShowId()).isEqualTo(SHOW_ID);
        assertThat(hold.getSeatIds()).containsExactlyInAnyOrderElementsOf(SEAT_IDS);
    }

    @Test
    void secondHoldForSameSeatFailsWithConflict() {
        reservationService.createHold(SHOW_ID, SEAT_IDS, "user-1");
        assertThatThrownBy(() -> reservationService.createHold(SHOW_ID, SEAT_IDS, "user-2"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Seat already held");
    }

    @Test
    void afterReleaseHoldSameSeatCanBeHeldAgain() {
        HoldResponse hold1 = reservationService.createHold(SHOW_ID, SEAT_IDS, "user-1");
        reservationService.releaseHold(hold1.getHoldId());
        HoldResponse hold2 = reservationService.createHold(SHOW_ID, SEAT_IDS, "user-2");
        assertThat(hold2).isNotNull();
        assertThat(hold2.getHoldId()).isNotEqualTo(hold1.getHoldId());
    }
}
