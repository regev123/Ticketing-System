package com.ticketing.order.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelSeatsRequest {

    @NotEmpty(message = "seatIds cannot be empty")
    private Set<String> seatIds;
}
