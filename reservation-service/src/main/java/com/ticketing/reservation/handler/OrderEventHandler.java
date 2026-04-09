package com.ticketing.reservation.handler;

import com.ticketing.events.order.OrderCancelledEvent;
import com.ticketing.events.order.OrderConfirmedEvent;
import com.ticketing.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Handles order events from Kafka: order.confirmed and order.cancelled.
 * Confirms or releases holds based on order outcome.
 */
@Component
@RequiredArgsConstructor
public class OrderEventHandler {

    private final ReservationService reservationService;

    /**
     * Order confirmed: hold fulfilled, release hold and seat locks.
     */
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        String holdId = event.getHoldId();
        if (holdId == null || holdId.isBlank()) {
            return;
        }
        reservationService.releaseHold(holdId);
    }

    /**
     * Order cancelled: release hold so seats return to available pool.
     */
    public void handleOrderCancelled(OrderCancelledEvent event) {
        String holdId = event.getHoldId();
        if (holdId == null || holdId.isBlank()) {
            return;
        }
        reservationService.releaseHold(holdId);
    }
}
