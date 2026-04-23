package com.ticketing.order.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "order.cancellation")
@Getter
@Setter
public class OrderCancellationPolicyProperties {
    private boolean enabled = true;
    private int cutoffHours = 24;
    private int refundPercentBeforeCutoff = 100;
    private int refundPercentAfterCutoff = 0;
}
