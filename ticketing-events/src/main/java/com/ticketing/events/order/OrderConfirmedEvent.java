package com.ticketing.events.order;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.ticketing.events.BaseEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

/** Event emitted when order is confirmed after successful payment. */
@Getter
@Setter
@NoArgsConstructor
@JsonTypeName("order.confirmed")
public class OrderConfirmedEvent extends BaseEvent {
    private String orderId;
    private String holdId;
    private String showId;
    private Set<String> seatIds;
    private String userId;
}
