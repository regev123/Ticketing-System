package com.ticketing.auth.service;

import com.ticketing.auth.event.NotificationEventPublisher;
import com.ticketing.events.notification.NotificationRequestedEvent;
import com.ticketing.events.notification.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class VerificationEmailService {
    private static final Logger log = LoggerFactory.getLogger(VerificationEmailService.class);

    @Value("${auth.email.enabled:false}")
    private boolean emailEnabled;

    private final NotificationEventPublisher notificationEventPublisher;

    public VerificationEmailService(NotificationEventPublisher notificationEventPublisher) {
        this.notificationEventPublisher = notificationEventPublisher;
    }

    public void sendVerificationEmail(String recipientEmail, String token) {
        if (!emailEnabled) {
            log.info("Email sending disabled; verification event suppressed for {}", recipientEmail);
            return;
        }
        var event = new NotificationRequestedEvent();
        event.setEmail(recipientEmail);
        event.setNotificationType(NotificationType.EMAIL_VERIFICATION);
        event.setVerificationToken(token);
        notificationEventPublisher.publish(event);
        log.info("Verification email event published for {}", recipientEmail);
    }
}
