package com.ticketing.payment.handler;

import com.ticketing.events.payment.PaymentFailedEvent;
import com.ticketing.events.payment.PaymentRequestedEvent;
import com.ticketing.events.payment.PaymentSucceededEvent;
import com.ticketing.payment.config.PaymentProperties;
import com.ticketing.payment.event.PaymentEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Handles payment.requested: mock payment processing.
 * SRP: process payment and publish succeeded/failed based on configured success rate.
 */
@Component
@RequiredArgsConstructor
public class PaymentRequestHandler {

    private final PaymentProperties paymentProperties;
    private final PaymentEventPublisher paymentEventPublisher;

    public void handle(PaymentRequestedEvent event) {
        boolean success = ThreadLocalRandom.current().nextDouble() < paymentProperties.getSuccessRate();

        if (success) {
            var succeeded = new PaymentSucceededEvent();
            succeeded.setPaymentId(event.getPaymentId());
            succeeded.setOrderId(event.getOrderId());
            paymentEventPublisher.publishSucceeded(succeeded);
        } else {
            var failed = new PaymentFailedEvent();
            failed.setPaymentId(event.getPaymentId());
            failed.setOrderId(event.getOrderId());
            failed.setReason("Mock payment declined");
            paymentEventPublisher.publishFailed(failed);
        }
    }
}
