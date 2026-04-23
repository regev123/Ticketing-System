package com.ticketing.notification;

import com.ticketing.common.config.WebConfig;
import com.ticketing.common.ticket.TicketQrTokenService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * Notification service entry point.
 * Consumes notification.requested from Kafka and sends email notifications.
 */
@SpringBootApplication
@Import({WebConfig.class, TicketQrTokenService.class})
public class NotificationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
