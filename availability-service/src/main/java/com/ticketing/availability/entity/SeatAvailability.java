package com.ticketing.availability.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seat availability response for a show.
 * Cached from catalog; excludes reservation holds (managed by reservation-service).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Seat availability for a show")
public class SeatAvailability {

    @Schema(description = "Show ID")
    private String showId;
    @Schema(description = "Show title")
    private String showTitle;
    @Schema(description = "List of seats with pricing")
    private List<SeatInfo> seats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Seat information")
    public static class SeatInfo {
        @Schema(description = "Seat ID", example = "A-1")
        private String id;
        @Schema(description = "Section", example = "A")
        private String section;
        @Schema(description = "Row number")
        private int row;
        @Schema(description = "Seat number")
        private int number;
        @Schema(description = "Price")
        private BigDecimal price;
        @Schema(description = "Currency code", example = "USD")
        private String currency;
    }
}
