package com.ticketing.reservation.controller;

import com.ticketing.common.constant.HttpStatusCodes;
import com.ticketing.common.exception.ErrorResponse;
import com.ticketing.common.auth.JwtAuthSupport;
import com.ticketing.reservation.constant.ApiPaths;
import com.ticketing.reservation.dto.BatchHoldRequest;
import com.ticketing.reservation.dto.BatchHoldResponse;
import com.ticketing.reservation.dto.BatchReleaseRequest;
import com.ticketing.reservation.dto.BatchReleaseResponse;
import com.ticketing.reservation.dto.CreateHoldRequest;
import com.ticketing.reservation.dto.ExtendHoldRequest;
import com.ticketing.reservation.dto.ExtendHoldResponse;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

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
    private final JwtAuthSupport jwtAuthSupport;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create hold", description = "Hold seats for 7 minutes. Returns holdId for order creation.")
    @ApiResponses({
            @ApiResponse(responseCode = HttpStatusCodes.CREATED_STR, description = "Hold created"),
            @ApiResponse(responseCode = HttpStatusCodes.CONFLICT_STR, description = "Seat already held",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public HoldResponse createHold(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateHoldRequest request) {
        String userId = jwtAuthSupport.requireAccessToken(authorization).userId();
        return reservationService.createHold(
                request.getShowId(),
                request.getSeatIds(),
                userId
        );
    }

    @DeleteMapping(ApiPaths.HOLD_BY_ID)
    @Operation(summary = "Release hold", description = "Release a hold (e.g. after order cancelled)")
    public void releaseHold(@PathVariable("holdId") String holdId) {
        reservationService.releaseHold(holdId);
    }

    @GetMapping(ApiPaths.SHOW_LOCKED_SEATS)
    @Operation(summary = "Locked seat IDs", description = "Seat IDs currently held (Redis locks) for this show")
    public Set<String> getLockedSeatIds(@PathVariable("showId") String showId) {
        return reservationService.getLockedSeatIdsForShow(showId);
    }

    @GetMapping(ApiPaths.SHOW_MY_HOLD)
    @Operation(summary = "My active hold for show", description = "Returns the signed-in user's active hold for this show, or 204 if none")
    public ResponseEntity<HoldResponse> getMyActiveHold(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("showId") String showId) {
        String userId = jwtAuthSupport.requireAccessToken(authorization).userId();
        return reservationService.getMyActiveHoldForShow(showId, userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping(ApiPaths.BATCH_HOLD)
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Batch hold seats", description = "SET seat keys NX EX 420; partial success; optional holdId to merge")
    public BatchHoldResponse batchHold(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody BatchHoldRequest request) {
        String userId = jwtAuthSupport.requireAccessToken(authorization).userId();
        return reservationService.batchHold(request, userId);
    }

    @PostMapping(ApiPaths.BATCH_RELEASE)
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Batch release seats", description = "Only if held by this user")
    public BatchReleaseResponse batchRelease(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody BatchReleaseRequest request) {
        String userId = jwtAuthSupport.requireAccessToken(authorization).userId();
        return reservationService.batchRelease(request, userId);
    }

    @PostMapping(ApiPaths.EXTEND_HOLD)
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Extend hold TTL", description = "Refresh EX 420 for seats owned by user")
    public ExtendHoldResponse extendHold(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody ExtendHoldRequest request) {
        String userId = jwtAuthSupport.requireAccessToken(authorization).userId();
        return reservationService.extendHold(request, userId);
    }
}
