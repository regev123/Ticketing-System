package com.ticketing.availability.controller;

import com.ticketing.availability.constant.ApiPaths;
import com.ticketing.availability.entity.SeatAvailability;
import com.ticketing.common.constant.HttpStatusCodes;
import com.ticketing.availability.service.AvailabilityService;
import com.ticketing.common.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for seat availability.
 * SRP: HTTP layer only; delegates to AvailabilityService.
 * DIP: depends on AvailabilityService interface.
 */
@RestController
@RequestMapping(ApiPaths.AVAILABILITY)
@Tag(name = "Availability", description = "Seat availability API - cached from catalog")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping(ApiPaths.SHOW_BY_ID)
    @Operation(summary = "Get availability for show", description = "Returns seat availability for a show (cached in Redis)")
    @ApiResponses({
            @ApiResponse(responseCode = HttpStatusCodes.OK_STR, description = "Availability retrieved"),
            @ApiResponse(responseCode = HttpStatusCodes.NOT_FOUND_STR, description = "Show not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public SeatAvailability getAvailability(
            @Parameter(description = "Show ID", required = true, example = "507f1f77bcf86cd799439011")
            @PathVariable("showId") String showId) {
        return availabilityService.getShowAvailability(showId);
    }
}
