package com.ticketing.order.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class ScanTicketResponse {
    ScanTicketResult result;
    String message;
    String orderId;
    String seatId;
    String showId;
    Instant scannedAt;
}
