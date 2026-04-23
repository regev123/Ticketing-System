package com.ticketing.events.notification;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.ticketing.events.BaseEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

/** Event emitted when a notification (email, etc.) should be sent. */
@Getter
@Setter
@NoArgsConstructor
@JsonTypeName("notification.requested")
public class NotificationRequestedEvent extends BaseEvent {
    private String orderId;
    private String userId;
    private String email;
    private NotificationType notificationType;
    private String subject;
    private String body;
    private Set<String> seatIds;
    private String showTitle;
    private String venueName;
    private String startTime;
    private String verificationToken;
}
