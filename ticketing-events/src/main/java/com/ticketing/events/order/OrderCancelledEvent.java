package com.ticketing.events.order;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.ticketing.events.BaseEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

/** Event emitted when order is cancelled (payment failed or hold expired). */
@Getter
@Setter
@NoArgsConstructor
@JsonTypeName("order.cancelled")
public class OrderCancelledEvent extends BaseEvent {
    private String orderId;
    private String holdId;
    private String showId;
    private Set<String> seatIds;
    private String reason;
}
