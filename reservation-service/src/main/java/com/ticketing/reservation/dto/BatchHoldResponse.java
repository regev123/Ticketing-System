package com.ticketing.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchHoldResponse {

    private List<String> success;
    private List<String> failed;
    /** Present when at least one seat is held after this call */
    private HoldResponse hold;
}
