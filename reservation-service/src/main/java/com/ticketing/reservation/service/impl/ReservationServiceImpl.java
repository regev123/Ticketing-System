package com.ticketing.reservation.service.impl;

import com.ticketing.common.exception.BadRequestException;
import com.ticketing.reservation.constant.RedisKeys;
import com.ticketing.reservation.dto.BatchHoldRequest;
import com.ticketing.reservation.dto.BatchHoldResponse;
import com.ticketing.reservation.dto.BatchReleaseRequest;
import com.ticketing.reservation.dto.BatchReleaseResponse;
import com.ticketing.reservation.dto.ExtendHoldRequest;
import com.ticketing.reservation.dto.ExtendHoldResponse;
import com.ticketing.reservation.dto.HoldResponse;
import com.ticketing.reservation.entity.HoldData;
import com.ticketing.reservation.event.ReservationEventPublisher;
import com.ticketing.reservation.mapper.HoldMapper;
import com.ticketing.reservation.integration.AvailabilityCacheNotifier;
import com.ticketing.reservation.mapper.event.HoldDataToReservationCreatedEventMapper;
import com.ticketing.reservation.repository.HoldDataRepository;
import com.ticketing.reservation.repository.SeatBatchResult;
import com.ticketing.reservation.service.ReservationService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Redis: seat:{showId}:{seatId} -> userId (EX 420s), hold:{holdId} -> HoldData JSON.
 */
@Service
public class ReservationServiceImpl implements ReservationService {

    private final HoldDataRepository holdDataRepository;
    private final HoldMapper holdMapper;
    private final HoldDataToReservationCreatedEventMapper reservationCreatedEventMapper;
    private final ReservationEventPublisher eventPublisher;
    private final AvailabilityCacheNotifier availabilityCacheNotifier;

    public ReservationServiceImpl(HoldDataRepository holdDataRepository,
                                  HoldMapper holdMapper,
                                  HoldDataToReservationCreatedEventMapper reservationCreatedEventMapper,
                                  ReservationEventPublisher eventPublisher,
                                  AvailabilityCacheNotifier availabilityCacheNotifier) {
        this.holdDataRepository = holdDataRepository;
        this.holdMapper = holdMapper;
        this.reservationCreatedEventMapper = reservationCreatedEventMapper;
        this.eventPublisher = eventPublisher;
        this.availabilityCacheNotifier = availabilityCacheNotifier;
    }

    @Override
    public HoldResponse createHold(String showId, Set<String> seatIds, String userId) {
        String holdId = java.util.UUID.randomUUID().toString();
        long expiresAt = Instant.now().plusMillis(RedisKeys.HOLD_TTL_MS).toEpochMilli();

        holdDataRepository.acquireSeatLocks(showId, seatIds, userId);

        try {
            HoldData holdData = buildHoldData(holdId, showId, seatIds, userId, expiresAt);

            holdDataRepository.save(holdData);
            holdDataRepository.saveHoldMeta(holdId, showId, seatIds);
            holdDataRepository.setActiveHoldId(showId, userId, holdId);

            eventPublisher.publishReservationCreated(reservationCreatedEventMapper.toEvent(holdData));

            availabilityCacheNotifier.notifyAvailabilityChanged(showId);

            return holdMapper.toDto(holdData);
        } catch (Exception e) {
            holdDataRepository.deleteSeatLocks(showId, seatIds);
            throw e;
        }
    }

    @Override
    public BatchHoldResponse batchHold(BatchHoldRequest request, String userId) {
        String showId = request.getShowId();
        Set<String> requested = new LinkedHashSet<>(request.getSeats());
        SeatBatchResult partial = holdDataRepository.tryAcquireSeatsPartial(showId, requested, userId);
        Set<String> ok = new LinkedHashSet<>(partial.success());
        Set<String> bad = new LinkedHashSet<>(partial.failed());

        HoldData existing = null;
        String holdId;
        if (request.getHoldId() != null && !request.getHoldId().isBlank()) {
            existing = holdDataRepository.findById(request.getHoldId());
            if (existing == null
                    || !existing.getUserId().equals(userId)
                    || !existing.getShowId().equals(showId)) {
                throw new BadRequestException("Invalid or expired holdId");
            }
            holdId = request.getHoldId();
        } else {
            String indexed = holdDataRepository.getActiveHoldId(showId, userId);
            if (indexed != null) {
                HoldData indexedHold = holdDataRepository.findById(indexed);
                if (indexedHold != null
                        && userId.equals(indexedHold.getUserId())
                        && showId.equals(indexedHold.getShowId())) {
                    existing = indexedHold;
                    holdId = indexed;
                } else {
                    holdDataRepository.deleteActiveHoldId(showId, userId);
                }
            }
            if (existing == null) {
                holdId = java.util.UUID.randomUUID().toString();
            } else {
                holdId = existing.getHoldId();
            }
        }

        if (ok.isEmpty() && existing == null) {
            return new BatchHoldResponse(List.copyOf(ok), List.copyOf(bad), null);
        }
        if (ok.isEmpty() && existing != null) {
            return new BatchHoldResponse(List.copyOf(ok), List.copyOf(bad), holdMapper.toDto(existing));
        }

        Set<String> allSeats = new LinkedHashSet<>();
        if (existing != null) {
            allSeats.addAll(existing.getSeatIds());
        }
        allSeats.addAll(ok);
        long expiresAt = Instant.now().plusMillis(RedisKeys.HOLD_TTL_MS).toEpochMilli();
        HoldData holdData = buildHoldData(holdId, showId, allSeats, userId, expiresAt);
        holdDataRepository.save(holdData);
        holdDataRepository.saveHoldMeta(holdId, showId, allSeats);
        holdDataRepository.setActiveHoldId(showId, userId, holdId);

        eventPublisher.publishReservationCreated(reservationCreatedEventMapper.toEvent(holdData));
        availabilityCacheNotifier.notifyAvailabilityChanged(showId);

        return new BatchHoldResponse(List.copyOf(ok), List.copyOf(bad), holdMapper.toDto(holdData));
    }

    @Override
    public BatchReleaseResponse batchRelease(BatchReleaseRequest request, String userId) {
        HoldData hold = holdDataRepository.findById(request.getHoldId());
        if (hold == null || !hold.getUserId().equals(userId)) {
            throw new BadRequestException("Invalid hold");
        }
        if (!hold.getShowId().equals(request.getShowId())) {
            throw new BadRequestException("Show mismatch");
        }
        Set<String> released = holdDataRepository.releaseSeatsIfOwned(
                hold.getShowId(), new HashSet<>(request.getSeats()), userId);
        Set<String> remaining = new LinkedHashSet<>(hold.getSeatIds());
        remaining.removeAll(released);

        if (remaining.isEmpty()) {
            removeHoldCompletely(request, hold);
        } else {
            refreshHoldAfterPartialRelease(request, hold, remaining, userId);
        }
        availabilityCacheNotifier.notifyAvailabilityChanged(hold.getShowId());
        return new BatchReleaseResponse(List.copyOf(released));
    }

    @Override
    public ExtendHoldResponse extendHold(ExtendHoldRequest request, String userId) {
        HoldData hold = holdDataRepository.findById(request.getHoldId());
        if (hold == null || !hold.getUserId().equals(userId)) {
            throw new BadRequestException("Invalid hold");
        }
        if (!hold.getShowId().equals(request.getShowId())) {
            throw new BadRequestException("Show mismatch");
        }
        long ttlSeconds = request.getTtlSeconds() != null
                ? request.getTtlSeconds()
                : RedisKeys.SEAT_HOLD_TTL_SECONDS;
        long holdTtlMs = ttlSeconds * 1000L;
        int n = holdDataRepository.extendSeatsTtlIfOwned(
                hold.getShowId(), new HashSet<>(request.getSeats()), userId, ttlSeconds);
        long expiresAt = Instant.now().plusMillis(holdTtlMs).toEpochMilli();
        HoldData updated = buildHoldData(hold.getHoldId(), hold.getShowId(),
                hold.getSeatIds(), hold.getUserId(), expiresAt);
        holdDataRepository.saveWithTtl(updated, holdTtlMs);
        holdDataRepository.setActiveHoldId(hold.getShowId(), hold.getUserId(), hold.getHoldId());
        availabilityCacheNotifier.notifyAvailabilityChanged(hold.getShowId());
        return new ExtendHoldResponse(n);
    }

    @Override
    public void releaseHold(String holdId) {
        HoldData hold = holdDataRepository.findById(holdId);
        if (hold != null) {
            holdDataRepository.delete(holdId, hold.getShowId(), hold.getSeatIds());
            String indexed = holdDataRepository.getActiveHoldId(hold.getShowId(), hold.getUserId());
            if (indexed != null && indexed.equals(hold.getHoldId())) {
                holdDataRepository.deleteActiveHoldId(hold.getShowId(), hold.getUserId());
            }
            availabilityCacheNotifier.notifyAvailabilityChanged(hold.getShowId());
        }
    }

    @Override
    public Set<String> getLockedSeatIdsForShow(String showId) {
        return holdDataRepository.findLockedSeatIdsForShow(showId);
    }

    @Override
    public Optional<HoldResponse> getMyActiveHoldForShow(String showId, String userId) {
        String holdId = holdDataRepository.getActiveHoldId(showId, userId);
        if (holdId == null || holdId.isBlank()) {
            return Optional.empty();
        }
        HoldData hold = holdDataRepository.findById(holdId);
        if (hold == null
                || !userId.equals(hold.getUserId())
                || !showId.equals(hold.getShowId())
                || hold.getSeatIds() == null
                || hold.getSeatIds().isEmpty()) {
            holdDataRepository.deleteActiveHoldId(showId, userId);
            return Optional.empty();
        }
        return Optional.of(holdMapper.toDto(hold));
    }

    private void removeHoldCompletely(BatchReleaseRequest request, HoldData hold) {
        holdDataRepository.delete(request.getHoldId(), hold.getShowId(), hold.getSeatIds());
        holdDataRepository.deleteActiveHoldId(hold.getShowId(), hold.getUserId());
    }

    private void refreshHoldAfterPartialRelease(BatchReleaseRequest request, HoldData hold,
                                                Set<String> remaining, String userId) {
        long expiresAt = Instant.now().plusMillis(RedisKeys.HOLD_TTL_MS).toEpochMilli();
        HoldData updated = buildHoldData(request.getHoldId(), hold.getShowId(), remaining,
                userId, expiresAt);
        holdDataRepository.save(updated);
        holdDataRepository.saveHoldMeta(request.getHoldId(), hold.getShowId(), remaining);
        holdDataRepository.setActiveHoldId(hold.getShowId(), userId, request.getHoldId());
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
