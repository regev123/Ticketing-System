package com.ticketing.payment.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Payment mock configuration.
 * Controls success rate for testing (1.0 = always succeed, 0.0 = always fail).
 */
@Component
@ConfigurationProperties(prefix = "payment.mock")
@Getter
@Setter
public class PaymentProperties {

    /**
     * Success rate 0.0–1.0. Default 1.0 (always succeed).
     */
    private double successRate = 1.0;
}
