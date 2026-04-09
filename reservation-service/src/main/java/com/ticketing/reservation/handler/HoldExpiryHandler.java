package com.ticketing.reservation.handler;

import com.ticketing.reservation.event.ReservationEventPublisher;
import com.ticketing.reservation.mapper.event.HoldExpiredToReservationExpiredEventMapper;
import com.ticketing.reservation.mapper.event.ReservationExpiredEventSource;
import com.ticketing.reservation.integration.AvailabilityCacheNotifier;
import com.ticketing.reservation.repository.HoldDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Handles hold expiration events from Redis keyspace notifications.
 * Single responsibility: process expired holds and publish reservation.expired.
 */
@Component
@RequiredArgsConstructor
public class HoldExpiryHandler {

    private final HoldDataRepository holdDataRepository;
    private final HoldExpiredToReservationExpiredEventMapper expiredEventMapper;
    private final ReservationEventPublisher eventPublisher;
    private final AvailabilityCacheNotifier availabilityCacheNotifier;

    /**
     * Called when a hold key expires. Publishes reservation.expired and cleans up metadata.
     */
    public void onHoldExpired(String holdId) {
        try {
            var meta = holdDataRepository.findHoldMeta(holdId);
            String showId = meta != null ? meta.showId() : null;
            Set<String> seatIds = meta != null && meta.seatIds() != null ? meta.seatIds() : Set.of();

            var source = new ReservationExpiredEventSource(holdId, showId, seatIds);
            eventPublisher.publishReservationExpired(expiredEventMapper.toEvent(source));

            if (meta != null) {
                holdDataRepository.deleteHoldMeta(holdId);
            }
            if (showId != null) {
                availabilityCacheNotifier.notifyAvailabilityChanged(showId);
            }
        } catch (Exception e) {
            var source = new ReservationExpiredEventSource(holdId, null, Set.of());
            eventPublisher.publishReservationExpired(expiredEventMapper.toEvent(source));
        }
    }
}
