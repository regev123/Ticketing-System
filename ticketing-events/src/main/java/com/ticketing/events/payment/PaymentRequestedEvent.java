package com.ticketing.events.payment;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.ticketing.events.BaseEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Event emitted when payment is requested for an order. */
@Getter
@Setter
@NoArgsConstructor
@JsonTypeName("payment.requested")
public class PaymentRequestedEvent extends BaseEvent {
    private String paymentId;
    private String orderId;
    private String holdId;
    private BigDecimal amount;
    private String currency;
    private String userId;
}
