package com.ticketing.events.payment;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.ticketing.events.BaseEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Event emitted when payment fails. */
@Getter
@Setter
@NoArgsConstructor
@JsonTypeName("payment.failed")
public class PaymentFailedEvent extends BaseEvent {
    private String paymentId;
    private String orderId;
    private String reason;
}
