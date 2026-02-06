package com.ticketing.reservation.controller;

import com.ticketing.common.constant.HttpStatusCodes;
import com.ticketing.common.exception.ErrorResponse;
import com.ticketing.reservation.constant.ApiPaths;
import com.ticketing.reservation.dto.CreateHoldRequest;
import com.ticketing.reservation.dto.HoldResponse;
import com.ticketing.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for seat reservations/holds.
 * SRP: HTTP layer only; delegates to ReservationService.
 * DIP: depends on ReservationService interface.
 */
@RestController
@RequestMapping(ApiPaths.RESERVATIONS)
@Tag(name = "Reservations", description = "Seat holds with Redis locks - anti-double-booking")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create hold", description = "Hold seats for 7 minutes. Returns holdId for order creation.")
    @ApiResponses({
            @ApiResponse(responseCode = HttpStatusCodes.CREATED_STR, description = "Hold created"),
            @ApiResponse(responseCode = HttpStatusCodes.CONFLICT_STR, description = "Seat already held",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public HoldResponse createHold(@Valid @RequestBody CreateHoldRequest request) {
        return reservationService.createHold(
                request.getShowId(),
                request.getSeatIds(),
                request.getUserId()
        );
    }

    @DeleteMapping(ApiPaths.HOLD_BY_ID)
    @Operation(summary = "Release hold", description = "Release a hold (e.g. after order cancelled)")
    public void releaseHold(@PathVariable("holdId") String holdId) {
        reservationService.releaseHold(holdId);
    }
}
