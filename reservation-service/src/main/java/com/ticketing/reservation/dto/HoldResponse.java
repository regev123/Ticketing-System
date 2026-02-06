package com.ticketing.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoldResponse {

    private String holdId;
    private String showId;
    private Set<String> seatIds;
    private String userId;
    private long expiresAt;
}
