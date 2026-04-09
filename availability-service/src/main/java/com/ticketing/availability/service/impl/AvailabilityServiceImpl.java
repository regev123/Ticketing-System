package com.ticketing.availability.service.impl;

import com.ticketing.availability.client.CatalogClient;
import com.ticketing.availability.client.OrderSeatClient;
import com.ticketing.availability.client.ReservationSeatClient;
import com.ticketing.availability.constant.CacheConstants;
import com.ticketing.availability.entity.SeatAvailability;
import com.ticketing.availability.mapper.SeatAvailabilityMapper;
import com.ticketing.availability.service.AvailabilityService;
import com.ticketing.common.contract.catalog.CatalogShowResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * Implementation of AvailabilityService.
 * SRP: catalog seats minus Redis holds and active orders; Redis-cached briefly.
 */
@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final CatalogClient catalogClient;
    private final SeatAvailabilityMapper mapper;
    private final ReservationSeatClient reservationSeatClient;
    private final OrderSeatClient orderSeatClient;
    private final CacheManager cacheManager;

    @Override
    @Cacheable(cacheNames = CacheConstants.CACHE_NAME, key = "#showId")
    public SeatAvailability getShowAvailability(String showId) {
        CatalogShowResponse catalog = catalogClient.fetchCatalogShow(showId).block();
        Set<String> unavailable = new HashSet<>();
        unavailable.addAll(reservationSeatClient.getLockedSeatIds(showId).blockOptional().orElse(Set.of()));
        unavailable.addAll(orderSeatClient.getUnavailableSeatIdsFromOrders(showId).blockOptional().orElse(Set.of()));
        CatalogShowResponse filtered = withoutUnavailableSeats(catalog, unavailable);
        return mapper.toEntity(filtered);
    }

    @Override
    public void evictAvailabilityCache(String showId) {
        var cache = cacheManager.getCache(CacheConstants.CACHE_NAME);
        if (cache != null) {
            cache.evict(showId);
        }
    }

    private static CatalogShowResponse withoutUnavailableSeats(CatalogShowResponse response, Set<String> unavailableSeatIds) {
        if (unavailableSeatIds.isEmpty()) {
            return response;
        }
        var seats = response.seats().stream()
                .filter(s -> !unavailableSeatIds.contains(s.id()))
                .toList();
        return new CatalogShowResponse(
                response.id(),
                response.title(),
                response.category(),
                response.description(),
                response.doorsOpenTime(),
                response.startTime(),
                response.endTime(),
                seats
        );
    }
}
