package com.ticketing.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating editable show fields.
 * V1 intentionally excludes seat layout and category updates.
 */
@Schema(description = "Request to update editable fields on an existing show")
public record UpdateShowRequest(
        @NotBlank
        @Size(max = 255)
        @Schema(description = "Show title", example = "Rock Concert 2025", requiredMode = Schema.RequiredMode.REQUIRED)
        String title,

        @NotBlank
        @Size(max = 64)
        @Schema(description = "Show category", example = "music", requiredMode = Schema.RequiredMode.REQUIRED)
        String category,

        @Size(max = 1500)
        @Schema(description = "Optional show description", example = "Updated event description.")
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

        @Size(max = 1_500_000)
        @Schema(description = "Optional poster URL (https) or data URL; omit for default placeholder image on clients")
        String coverImageUrl,

        @NotNull
        @Valid
        @Schema(description = "Venue details (denormalized and stored with the show)", requiredMode = Schema.RequiredMode.REQUIRED)
        CreateShowRequest.Venue venue
) {
}
