package com.ticketing.order.controller;

import com.ticketing.common.constant.HttpStatusCodes;
import com.ticketing.common.exception.ForbiddenException;
import com.ticketing.common.exception.ErrorResponse;
import com.ticketing.common.auth.JwtAuthSupport;
import com.ticketing.order.constant.ApiPaths;
import com.ticketing.order.dto.CancelSeatsRequest;
import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;
import com.ticketing.order.dto.PagedResponse;
import com.ticketing.order.dto.AdminMetricsResponse;
import com.ticketing.order.dto.ScanTicketRequest;
import com.ticketing.order.dto.ScanTicketResponse;
import com.ticketing.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
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
    private final JwtAuthSupport jwtAuthSupport;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create order", description = "Creates order in PAYMENT_PENDING, publishes payment.requested")
    @ApiResponses({
            @ApiResponse(responseCode = HttpStatusCodes.CREATED_STR, description = "Order created"),
            @ApiResponse(responseCode = HttpStatusCodes.BAD_REQUEST_STR, description = "Invalid request",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public OrderResponse createOrder(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateOrderRequest request) {
        String userId = requireNonScannerUserId(authorization);
        return orderService.createOrder(request, userId);
    }

    @GetMapping(ApiPaths.SHOW_UNAVAILABLE_SEAT_IDS)
    @Operation(summary = "Unavailable seat IDs", description = "Seats on orders that are not cancelled (payment pending or confirmed)")
    public Set<String> getUnavailableSeatIds(@PathVariable("showId") String showId) {
        return orderService.getUnavailableSeatIdsForShow(showId);
    }

    @GetMapping(ApiPaths.MY_ORDERS)
    @Operation(summary = "My orders", description = "Returns paged order history for current user")
    public PagedResponse<OrderResponse> getMyOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size) {
        String userId = requireNonScannerUserId(authorization);
        return orderService.getMyOrders(userId, page, size);
    }

    @GetMapping(ApiPaths.ADMIN_METRICS)
    @Operation(summary = "Admin metrics", description = "Returns dashboard metrics for admin insights")
    public AdminMetricsResponse getAdminMetrics(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(name = "days", defaultValue = "30") int days) {
        jwtAuthSupport.requireAdmin(authorization);
        return orderService.getAdminMetrics(days);
    }

    @PostMapping(ApiPaths.CHECKIN_SCAN)
    @Operation(summary = "Scan ticket QR", description = "Validates and consumes a ticket QR token (one-time use)")
    public ScanTicketResponse scanTicket(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody ScanTicketRequest request) {
        var principal = jwtAuthSupport.requireScannerOrAdmin(authorization);
        return orderService.scanTicket(request.getQrToken(), request.getGateId(), principal);
    }

    @GetMapping(ApiPaths.MY_ORDER_BY_ID)
    @Operation(summary = "My order details", description = "Returns a single order if owned by current user")
    public OrderResponse getMyOrderById(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("orderId") String orderId) {
        String userId = requireNonScannerUserId(authorization);
        return orderService.getMyOrderById(userId, orderId);
    }

    @PostMapping(ApiPaths.MY_ORDER_CANCEL_SEATS)
    @Operation(summary = "Cancel selected seats", description = "Cancels one or more seats in an upcoming order owned by current user")
    public OrderResponse cancelMyOrderSeats(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("orderId") String orderId,
            @Valid @RequestBody CancelSeatsRequest request) {
        String userId = requireNonScannerUserId(authorization);
        return orderService.cancelMyOrderSeats(userId, orderId, request.getSeatIds());
    }

    @PostMapping(ApiPaths.MY_ORDER_CANCEL)
    @Operation(summary = "Cancel entire order", description = "Cancels all remaining seats in an upcoming order owned by current user")
    public OrderResponse cancelMyOrder(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("orderId") String orderId) {
        String userId = requireNonScannerUserId(authorization);
        return orderService.cancelMyOrder(userId, orderId);
    }

    @GetMapping(ApiPaths.MY_ORDER_TICKET_BY_SEAT)
    @Operation(summary = "Download seat ticket PDF", description = "Downloads per-seat ticket PDF for user's order")
    public ResponseEntity<byte[]> downloadMyOrderSeatTicketPdf(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("orderId") String orderId,
            @PathVariable("seatId") String seatId) {
        String userId = requireNonScannerUserId(authorization);
        byte[] pdf = orderService.getMyTicketPdf(userId, orderId, seatId);
        String filename = "ticket-%s-%s.pdf".formatted(orderId, seatId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }

    private String requireNonScannerUserId(String authorization) {
        var principal = jwtAuthSupport.requireAccessToken(authorization);
        if (principal.isScanner()) {
            throw new ForbiddenException("Scanner role can only access ticket check-in");
        }
        return principal.userId();
    }
}
