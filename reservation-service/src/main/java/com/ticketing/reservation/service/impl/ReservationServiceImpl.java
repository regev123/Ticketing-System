package com.ticketing.reservation.service.impl;

import com.ticketing.reservation.constant.RedisKeys;
import com.ticketing.reservation.dto.HoldResponse;
import com.ticketing.reservation.entity.HoldData;
import com.ticketing.reservation.event.ReservationEventPublisher;
import com.ticketing.reservation.mapper.HoldMapper;
import com.ticketing.reservation.mapper.event.HoldDataToReservationCreatedEventMapper;
import com.ticketing.reservation.repository.HoldDataRepository;
import com.ticketing.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;

/**
 * Implements anti-double-booking with Redis SET NX PX.
 * seatlock:{showId}:{seatId} -> holdId, TTL 7 min.
 * hold:{holdId} -> HoldData JSON, TTL 7 min.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final HoldDataRepository holdDataRepository;
    private final HoldMapper holdMapper;
    private final HoldDataToReservationCreatedEventMapper reservationCreatedEventMapper;
    private final ReservationEventPublisher eventPublisher;

    @Override
    public HoldResponse createHold(String showId, Set<String> seatIds, String userId) {
        String holdId = java.util.UUID.randomUUID().toString();
        long expiresAt = Instant.now().plusMillis(RedisKeys.HOLD_TTL_MS).toEpochMilli();

        Set<String> lockedSeats = holdDataRepository.acquireSeatLocks(showId, seatIds, holdId);

        try {
            HoldData holdData = buildHoldData(holdId, showId, seatIds, userId, expiresAt);

            holdDataRepository.save(holdData);
            holdDataRepository.saveHoldMeta(holdId, showId, seatIds);

            eventPublisher.publishReservationCreated(reservationCreatedEventMapper.toEvent(holdData));

            return holdMapper.toDto(holdData);
        } catch (Exception e) {
            holdDataRepository.deleteSeatLocks(showId, lockedSeats);
            throw e;
        }
    }

    @Override
    public void releaseHold(String holdId) {
        HoldData hold = holdDataRepository.findById(holdId);
        if (hold != null) {
            holdDataRepository.delete(holdId, hold.getShowId(), hold.getSeatIds());
        }
    }

    private static HoldData buildHoldData(String holdId, String showId, Set<String> seatIds,
                                          String userId, long expiresAt) {
        return HoldData.builder()
                .holdId(holdId)
                .showId(showId)
                .seatIds(seatIds)
                .userId(userId)
                .expiresAt(expiresAt)
                .build();
    }
}
