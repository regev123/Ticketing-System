package com.ticketing.order.client;

/**
 * Resolves user email by userId.
 * DIP: mappers depend on this abstraction; production implementations integrate with user service.
 */
@FunctionalInterface
public interface UserEmailResolver {

    /**
     * Resolves email for the given userId.
     *
     * @param userId user identifier
     * @return email address, or null if unknown/unavailable
     */
    String resolveEmail(String userId);
}
