package com.ticketing.reservation.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Hold data stored in Redis at hold:{holdId}.
 * TTL matches seat locks (7 minutes).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HoldData {

    private String holdId;
    private String showId;
    private Set<String> seatIds;
    private String userId;
    private long expiresAt;
}
