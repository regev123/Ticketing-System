package com.ticketing.catalog.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Show/event entity with venue and seat information.
 * Liskov Substitution: can be used wherever a show document is expected.
 */
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "shows")
@Schema(description = "A show/event with venue and seat information")
public class Show {
    @Id
    @Schema(description = "Unique show identifier")
    private String id;
    @Schema(description = "Show title", example = "Rock Concert 2025")
    private String title;
    @Schema(description = "Show category", example = "music")
    private String category;
    @Schema(description = "Optional show description")
    private String description;
    @Schema(description = "Denormalized venue details saved with this show")
    private Venue venue;
    @Schema(description = "Doors open time (ISO-8601)")
    private Instant doorsOpenTime;
    @Schema(description = "Show start time (ISO-8601)")
    private Instant startTime;
    @Schema(description = "Show end time (ISO-8601)")
    private Instant endTime;
    @Schema(description = "Optional poster/cover image URL or data URL (https or data:image/*)")
    private String coverImageUrl;
    @Schema(description = "List of seats with pricing")
    private List<Seat> seats;

    @Schema(description = "Venue details for the show")
    public record Venue(
            String venueName,
            String city,
            String country,
            String address,
            Geo geo
    ) {}

    @Schema(description = "Geographic coordinates")
    public record Geo(
            double lat,
            double lng
    ) {}

    @Schema(description = "Seat within a show")
    public record Seat(
            @Schema(description = "Seat ID", example = "A-1") String id,
            @Schema(description = "Section", example = "A") String section,
            @Schema(description = "Row number") int row,
            @Schema(description = "Seat number") int number,
            @Schema(description = "Price") BigDecimal price,
            @Schema(description = "Currency code", example = "USD") String currency
    ) {}
}
