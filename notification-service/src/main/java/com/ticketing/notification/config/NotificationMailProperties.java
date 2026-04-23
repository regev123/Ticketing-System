package com.ticketing.notification.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "notification.email")
@Getter
@Setter
public class NotificationMailProperties {
    private boolean enabled = false;
    private String from = "no-reply@ticketing.local";
    private String verifyUrlBase = "http://localhost:5173/verify-email";
}
