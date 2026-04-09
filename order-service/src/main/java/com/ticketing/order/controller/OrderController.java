package com.ticketing.order.controller;

import com.ticketing.common.constant.HttpStatusCodes;
import com.ticketing.common.exception.ErrorResponse;
import com.ticketing.order.constant.ApiPaths;
import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;
import com.ticketing.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

/**
 * REST controller for orders.
 * SRP: HTTP layer only; delegates to OrderService.
 * DIP: depends on OrderService interface.
 */
@RestController
@RequestMapping(ApiPaths.ORDERS)
@Tag(name = "Orders", description = "Order creation - payment flow integration")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create order", description = "Creates order in PAYMENT_PENDING, publishes payment.requested")
    @ApiResponses({
            @ApiResponse(responseCode = HttpStatusCodes.CREATED_STR, description = "Order created"),
            @ApiResponse(responseCode = HttpStatusCodes.BAD_REQUEST_STR, description = "Invalid request",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping(ApiPaths.SHOW_UNAVAILABLE_SEAT_IDS)
    @Operation(summary = "Unavailable seat IDs", description = "Seats on orders that are not cancelled (payment pending or confirmed)")
    public Set<String> getUnavailableSeatIds(@PathVariable("showId") String showId) {
        return orderService.getUnavailableSeatIdsForShow(showId);
    }
}
