package com.ticketing.availability.service.impl;

import com.ticketing.availability.client.CatalogClient;
import com.ticketing.availability.constant.CacheConstants;
import com.ticketing.availability.entity.SeatAvailability;
import com.ticketing.availability.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Implementation of AvailabilityService.
 * SRP: orchestrate availability fetch via CatalogClient with Redis caching.
 */
@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final CatalogClient catalogClient;

    @Override
    @Cacheable(cacheNames = CacheConstants.CACHE_NAME, key = "#showId")
    public SeatAvailability getShowAvailability(String showId) {
        return catalogClient.getShowAvailability(showId)
                .block();
    }
}
