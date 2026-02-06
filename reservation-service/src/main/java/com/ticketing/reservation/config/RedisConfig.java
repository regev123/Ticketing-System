package com.ticketing.reservation.config;

import com.ticketing.reservation.constant.RedisKeys;
import com.ticketing.reservation.handler.HoldExpiryHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

/**
 * Redis infrastructure configuration.
 * Registers keyspace listener for hold expiration; delegates business logic to HoldExpiryHandler.
 */
@Configuration
@RequiredArgsConstructor
public class RedisConfig {

    /**
     * Redis keyspace notification pattern for expired keys (db 0).
     * When hold:{holdId} expires, this fires and we publish reservation.expired.
     */
    private static final String EXPIRED_KEYS_PATTERN = "__keyevent@0__:expired";

    private final RedisConnectionFactory connectionFactory;
    private final HoldExpiryHandler holdExpiryHandler;

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer() {
        var container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(holdExpiryListener(), new PatternTopic(EXPIRED_KEYS_PATTERN));
        return container;
    }

    private MessageListener holdExpiryListener() {
        return (message, pattern) -> {
            String key = message.toString();
            if (key.startsWith(RedisKeys.HOLD_PREFIX)) {
                String holdId = key.substring(RedisKeys.HOLD_PREFIX.length());
                holdExpiryHandler.onHoldExpired(holdId);
            }
        };
    }
}
