package com.ticketing.events.payment;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.ticketing.events.BaseEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Event emitted when payment succeeds. */
@Getter
@Setter
@NoArgsConstructor
@JsonTypeName("payment.succeeded")
public class PaymentSucceededEvent extends BaseEvent {
    private String paymentId;
    private String orderId;
}
