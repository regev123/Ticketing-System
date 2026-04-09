package com.ticketing.order.client.impl;

import com.ticketing.order.client.UserEmailResolver;
import org.springframework.stereotype.Component;

/**
 * Mock implementation that returns null.
 * In production, replace with an implementation that calls a user service.
 */
@Component
public class NullUserEmailResolver implements UserEmailResolver {

    @Override
    public String resolveEmail(String userId) {
        return null;
    }
}
