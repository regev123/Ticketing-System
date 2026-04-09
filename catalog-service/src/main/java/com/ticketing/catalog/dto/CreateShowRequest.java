package com.ticketing.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO for creating a new show.
 * Seat layout is defined by sections (e.g. section A: 5 rows × 10 seats, price 49.99).
 */
@Schema(description = "Request to create a new show with seat layout")
public record CreateShowRequest(
        @NotBlank
        @Size(max = 255)
        @Schema(description = "Show title", example = "Rock Concert 2025", requiredMode = Schema.RequiredMode.REQUIRED)
        String title,

        @NotBlank
        @Size(max = 64)
        @Schema(description = "Show category", example = "music", requiredMode = Schema.RequiredMode.REQUIRED)
        String category,

        @Size(max = 1500)
        @Schema(description = "Optional show description", example = "An electrifying live performance.")
        String description,

        @NotBlank
        @Schema(description = "Doors open time (ISO-8601)", example = "2025-03-15T17:30:00Z", requiredMode = Schema.RequiredMode.REQUIRED)
        String doorsOpenTime,

        @NotBlank
        @Schema(description = "Show start time (ISO-8601)", example = "2025-03-15T19:00:00Z", requiredMode = Schema.RequiredMode.REQUIRED)
        String startTime,

        @NotBlank
        @Schema(description = "Show end time (ISO-8601)", example = "2025-03-15T21:00:00Z", requiredMode = Schema.RequiredMode.REQUIRED)
        String endTime,

        @NotNull
        @Size(min = 1)
        @Valid
        @Schema(description = "Seat sections to generate", requiredMode = Schema.RequiredMode.REQUIRED)
        List<SectionInput> sections,

        @Size(max = 1_500_000)
        @Schema(description = "Optional poster URL (https) or data URL; omit for default placeholder image on clients")
        String coverImageUrl,

        @Valid
        @Schema(description = "Venue details (denormalized and stored with the show)")
        Venue venue
) {
    @Schema(description = "One venue/location saved along with a show")
    public record Venue(
            @NotBlank
            @Size(max = 255)
            @Schema(description = "Venue name", example = "Madison Square Garden", requiredMode = Schema.RequiredMode.REQUIRED)
            String venueName,

            @NotBlank
            @Size(max = 100)
            @Schema(description = "City", example = "New York", requiredMode = Schema.RequiredMode.REQUIRED)
            String city,

            @NotBlank
            @Size(max = 100)
            @Schema(description = "Country", example = "United States", requiredMode = Schema.RequiredMode.REQUIRED)
            String country,

            @NotBlank
            @Size(max = 255)
            @Schema(description = "Street address", example = "4 Pennsylvania Plaza", requiredMode = Schema.RequiredMode.REQUIRED)
            String address,

            @NotNull
            @Valid
            @Schema(description = "Geographic coordinates", requiredMode = Schema.RequiredMode.REQUIRED)
            Geo geo
    ) {
    }

    @Schema(description = "Geographic coordinates")
    public record Geo(
            @Schema(description = "Latitude", example = "40.7580", requiredMode = Schema.RequiredMode.REQUIRED)
            double lat,

            @Schema(description = "Longitude", example = "-73.9855", requiredMode = Schema.RequiredMode.REQUIRED)
            double lng
    ) {
    }

    @Schema(description = "One section of seats (e.g. section A: 5 rows × 10 seats)")
    public record SectionInput(
            @NotBlank
            @Size(max = 32)
            @Schema(description = "Section name", example = "A", requiredMode = Schema.RequiredMode.REQUIRED)
            String section,

            @Schema(description = "Number of rows", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
            int rowCount,

            @Schema(description = "Seats per row", example = "10", requiredMode = Schema.RequiredMode.REQUIRED)
            int seatsPerRow,

            @NotNull
            @Schema(description = "Price per seat", example = "49.99", requiredMode = Schema.RequiredMode.REQUIRED)
            BigDecimal price,

            @NotBlank
            @Size(max = 8)
            @Schema(description = "Currency code", example = "USD", requiredMode = Schema.RequiredMode.REQUIRED)
            String currency
    ) {}
}
