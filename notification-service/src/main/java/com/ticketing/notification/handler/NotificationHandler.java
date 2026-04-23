package com.ticketing.notification.handler;

import com.ticketing.events.notification.NotificationRequestedEvent;
import com.ticketing.events.notification.NotificationType;
import com.ticketing.notification.config.NotificationMailProperties;
import com.ticketing.notification.service.TicketPdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.util.CollectionUtils;

import java.util.Set;

/**
 * Handles notification.requested and sends email notifications.
 * SRP: process notification request.
 */
@Component
@RequiredArgsConstructor
public class NotificationHandler {
    private static final String DEFAULT_SUBJECT = "Notification";
    private static final String SUBJECT_VERIFICATION = "Verify your Ticketing account";
    private static final String DEFAULT_VERIFICATION_TOKEN = "";
    private static final String VERIFICATION_URL_QUERY_PREFIX = "?token=";
    private static final String TICKET_ATTACHMENT_PREFIX = "ticket-";
    private static final String TICKET_ATTACHMENT_SUFFIX = ".pdf";
    private static final String EMAIL_VERIFICATION_BODY_TEMPLATE = """
            Welcome to Ticketing!

            Please verify your email by opening this link:
            %s

            If you did not create this account, you can ignore this email.
            """;
    private static final String EMAIL_SEND_FAILED_MESSAGE = "Failed to send notification email";


    private final JavaMailSender mailSender;
    private final NotificationMailProperties mailProperties;
    private final TicketPdfGenerator ticketPdfGenerator;

    public void handle(NotificationRequestedEvent event) {
        if (!mailProperties.isEnabled()) return;
        if (event.getEmail() == null || event.getEmail().isBlank()) return;

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true);
            helper.setFrom(mailProperties.getFrom());
            helper.setTo(event.getEmail());
            helper.setSubject(resolveSubject(event));
            helper.setText(resolveBody(event), false);

            if (event.getNotificationType() == NotificationType.ORDER_CONFIRMED) {
                attachSeatTickets(
                        helper,
                        event.getOrderId(),
                        event.getSeatIds(),
                        null,
                        event.getShowTitle(),
                        event.getVenueName(),
                        event.getStartTime()
                );
            }

            mailSender.send(message);
        } catch (Exception e) {
            throw new IllegalStateException(EMAIL_SEND_FAILED_MESSAGE, e);
        }
    }

    private void attachSeatTickets(
            MimeMessageHelper helper,
            String orderId,
            Set<String> seatIds,
            String showId,
            String showTitle,
            String venueName,
            String startTime
    ) throws Exception {
        if (CollectionUtils.isEmpty(seatIds)) return;
        for (String seatId : seatIds) {
            byte[] pdf = ticketPdfGenerator.generateTicketPdf(orderId, seatId, showId, showTitle, venueName, startTime);
            helper.addAttachment(
                    TICKET_ATTACHMENT_PREFIX + seatId + TICKET_ATTACHMENT_SUFFIX,
                    () -> new java.io.ByteArrayInputStream(pdf)
            );
        }
    }

    private String resolveSubject(NotificationRequestedEvent event) {
        if (event.getNotificationType() == NotificationType.EMAIL_VERIFICATION) {
            return SUBJECT_VERIFICATION;
        }
        return event.getSubject() == null ? DEFAULT_SUBJECT : event.getSubject();
    }

    private String resolveBody(NotificationRequestedEvent event) {
        if (event.getNotificationType() == NotificationType.EMAIL_VERIFICATION) {
            String token = event.getVerificationToken() == null ? DEFAULT_VERIFICATION_TOKEN : event.getVerificationToken();
            String verificationUrl = mailProperties.getVerifyUrlBase() + VERIFICATION_URL_QUERY_PREFIX + token;
            return EMAIL_VERIFICATION_BODY_TEMPLATE.formatted(verificationUrl);
        }
        return event.getBody() == null ? "" : event.getBody();
    }
}
