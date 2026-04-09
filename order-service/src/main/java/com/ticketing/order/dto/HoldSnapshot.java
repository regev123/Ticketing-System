package com.ticketing.order.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Set;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HoldSnapshot {
    private String holdId;
    private String showId;
    private Set<String> seatIds;
    private String userId;
    private Long expiresAt;
}
