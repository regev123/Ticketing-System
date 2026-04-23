package com.ticketing.order.service.impl;

import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;
import com.ticketing.order.dto.PagedResponse;
import com.ticketing.order.dto.AdminMetricsResponse;
import com.ticketing.order.dto.ScanTicketResponse;
import com.ticketing.order.dto.ScanTicketResult;
import com.ticketing.common.auth.AuthPrincipal;
import com.ticketing.order.config.OrderCancellationPolicyProperties;
import com.ticketing.order.entity.Order;
import com.ticketing.order.entity.OrderStatus;
import com.ticketing.order.entity.TicketCheckIn;
import com.ticketing.order.event.PaymentEventPublisher;
import com.ticketing.order.integration.NotificationTicketClient;
import com.ticketing.order.integration.OrderSeatHoldVerifier;
import com.ticketing.order.integration.ReservationHoldClient;
import com.ticketing.order.mapper.OrderMapper;
import com.ticketing.order.mapper.event.OrderToPaymentRequestedEventMapper;
import com.ticketing.order.repository.OrderRepository;
import com.ticketing.order.repository.TicketCheckInRepository;
import com.ticketing.order.service.OrderService;
import com.ticketing.common.exception.BadRequestException;
import com.ticketing.common.exception.ResourceNotFoundException;
import com.ticketing.common.ticket.TicketQrTokenService;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Map;
import java.util.List;
import java.util.Set;
import java.util.Comparator;
import java.math.BigDecimal;

/**
 * Order service implementation.
 * SRP: orchestrate order creation, persistence, and payment.event publishing.
 * DIP: depends on OrderMapper, PaymentEventPublisher, OrderRepository interfaces.
 */
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderToPaymentRequestedEventMapper paymentRequestedEventMapper;
    private final PaymentEventPublisher paymentEventPublisher;
    private final OrderSeatHoldVerifier seatHoldVerifier;
    private final ReservationHoldClient reservationHoldClient;
    private final NotificationTicketClient notificationTicketClient;
    private final OrderCancellationPolicyProperties cancellationPolicyProperties;
    private final TicketQrTokenService ticketQrTokenService;
    private final TicketCheckInRepository ticketCheckInRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String userId) {
        seatHoldVerifier.verifyBeforeOrder(request, userId);

        Order order = orderMapper.toEntity(request, userId);
        order = orderRepository.save(order);

        paymentEventPublisher.publish(paymentRequestedEventMapper.toEvent(order));

        reservationHoldClient.releaseHold(request.getHoldId());

        return orderMapper.toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getMyOrders(String userId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        var orderPage = orderRepository.findByUserId(userId, pageable);
        return PagedResponse.<OrderResponse>builder()
                .items(orderPage.getContent().stream().map(orderMapper::toDto).toList())
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalItems(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getMyOrderById(String userId, String orderId) {
        return orderMapper.toDto(requireUserOrder(userId, orderId));
    }

    @Override
    @Transactional
    public OrderResponse cancelMyOrderSeats(String userId, String orderId, Set<String> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new BadRequestException("seatIds cannot be empty");
        }
        Order order = requireUserOrder(userId, orderId);
        ensureOrderCanBeCancelled(order);

        Set<String> activeSeats = order.getSeatIds();
        if (activeSeats == null || activeSeats.isEmpty()) {
            throw new BadRequestException("Order has no cancellable seats");
        }

        Set<String> normalizedRequested = seatIds.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(value -> value.trim())
                .collect(java.util.stream.Collectors.toSet());
        if (normalizedRequested.isEmpty()) {
            throw new BadRequestException("seatIds cannot be empty");
        }
        if (!activeSeats.containsAll(normalizedRequested)) {
            throw new BadRequestException("One or more seats are not part of this active order");
        }

        Set<String> remainingSeats = new HashSet<>(activeSeats);
        remainingSeats.removeAll(normalizedRequested);
        order.setSeatIds(remainingSeats);
        order.setStatus(resolveStatusAfterSeatCancellation(order.getStatus(), remainingSeats));
        orderRepository.save(order);
        return orderMapper.toDto(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelMyOrder(String userId, String orderId) {
        Order order = requireUserOrder(userId, orderId);
        ensureOrderCanBeCancelled(order);
        Set<String> activeSeats = order.getSeatIds();
        if (activeSeats == null || activeSeats.isEmpty()) {
            throw new BadRequestException("Order has no cancellable seats");
        }
        order.setSeatIds(new HashSet<>());
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return orderMapper.toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getMyTicketPdf(String userId, String orderId, String seatId) {
        Order order = requireUserOrder(userId, orderId);
        if (order.getSeatIds() == null || !order.getSeatIds().contains(seatId)) {
            throw ResourceNotFoundException.forResource("Order seat", seatId);
        }
        return notificationTicketClient.generateTicketPdf(order, seatId);
    }

    @Override
    public ScanTicketResponse scanTicket(String qrToken, String gateId, AuthPrincipal principal) {
        final TicketQrTokenService.TicketQrClaims claims;
        try {
            claims = ticketQrTokenService.parseAndValidate(qrToken);
        } catch (ExpiredJwtException e) {
            return ScanTicketResponse.builder()
                    .result(ScanTicketResult.INVALID)
                    .message("Ticket expired")
                    .build();
        } catch (Exception e) {
            return ScanTicketResponse.builder()
                    .result(ScanTicketResult.INVALID)
                    .message("Invalid QR token")
                    .build();
        }

        String orderId = claims.orderId();
        String seatId = claims.seatId();
        String showId = claims.showId();

        if (principal != null && principal.isScanner()) {
            // Global scanner: no assigned event means it can scan all events.
            boolean hasAssignedEvent = principal.scannerEventId() != null && !principal.scannerEventId().isBlank();
            if (hasAssignedEvent && !principal.scannerEventId().equals(showId)) {
                return invalidScan(orderId, seatId, showId, "Scanner account is not assigned to this event");
            }
            // Expiry is enforced only for event-bound scanner accounts.
            if (hasAssignedEvent && principal.scannerEventEndAt() != null && !principal.scannerEventEndAt().isBlank()) {
                try {
                    java.time.Instant scannerEventEndAt = java.time.Instant.parse(principal.scannerEventEndAt());
                    if (!scannerEventEndAt.isAfter(java.time.Instant.now())) {
                        return invalidScan(orderId, seatId, showId, "Scanner account expired for this event");
                    }
                } catch (Exception ignored) {
                    return invalidScan(orderId, seatId, showId, "Scanner account has invalid event expiry");
                }
            }
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return invalidScan(orderId, seatId, showId, "Order not found");
        }
        if (showId != null && !showId.isBlank() && order.getShowId() != null && !showId.equals(order.getShowId())) {
            return invalidScan(orderId, seatId, showId, "QR token does not match show");
        }
        if (order.getSeatIds() == null || !order.getSeatIds().contains(seatId)) {
            return invalidScan(orderId, seatId, order.getShowId(), "Seat is not active for this order");
        }

        var existingScan = ticketCheckInRepository.findByOrderIdAndSeatId(orderId, seatId);
        if (existingScan.isPresent()) {
            return ScanTicketResponse.builder()
                    .result(ScanTicketResult.ALREADY_USED)
                    .message("Ticket already used")
                    .orderId(orderId)
                    .seatId(seatId)
                    .showId(order.getShowId())
                    .scannedAt(existingScan.get().getScannedAt())
                    .build();
        }

        TicketCheckIn checkIn = new TicketCheckIn();
        checkIn.setOrderId(orderId);
        checkIn.setSeatId(seatId);
        checkIn.setShowId(order.getShowId());
        checkIn.setGateId(gateId);
        checkIn.setScannedAt(java.time.Instant.now());
        try {
            ticketCheckInRepository.save(checkIn);
        } catch (DataIntegrityViolationException duplicate) {
            var duplicateScan = ticketCheckInRepository.findByOrderIdAndSeatId(orderId, seatId).orElse(null);
            return ScanTicketResponse.builder()
                    .result(ScanTicketResult.ALREADY_USED)
                    .message("Ticket already used")
                    .orderId(orderId)
                    .seatId(seatId)
                    .showId(order.getShowId())
                    .scannedAt(duplicateScan != null ? duplicateScan.getScannedAt() : null)
                    .build();
        }

        return ScanTicketResponse.builder()
                .result(ScanTicketResult.SCANNED)
                .message("Ticket accepted")
                .orderId(orderId)
                .seatId(seatId)
                .showId(order.getShowId())
                .scannedAt(checkIn.getScannedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Set<String> getUnavailableSeatIdsForShow(String showId) {
        List<Order> orders = orderRepository.findByShowIdAndStatusIn(
                showId, List.of(OrderStatus.PAYMENT_PENDING, OrderStatus.CONFIRMED, OrderStatus.PARTIALLY_CANCELLED));
        Set<String> ids = new HashSet<>();
        for (Order o : orders) {
            if (o.getSeatIds() != null) {
                ids.addAll(o.getSeatIds());
            }
        }
        return ids;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminMetricsResponse getAdminMetrics(int days) {
        int windowDays = Math.max(1, Math.min(days, 365));
        java.time.Instant from = java.time.Instant.now().minus(java.time.Duration.ofDays(windowDays));
        List<Order> orders = orderRepository.findByCreatedAtAfter(from);
        List<com.ticketing.order.entity.TicketCheckIn> scans = ticketCheckInRepository.findByScannedAtAfter(from);

        long confirmed = orders.stream().filter(o -> o.getStatus() == OrderStatus.CONFIRMED).count();
        long pending = orders.stream().filter(o -> o.getStatus() == OrderStatus.PAYMENT_PENDING).count();
        long cancelled = orders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();
        long partial = orders.stream().filter(o -> o.getStatus() == OrderStatus.PARTIALLY_CANCELLED).count();
        long ticketsActive = orders.stream().mapToLong(o -> o.getSeatIds() == null ? 0 : o.getSeatIds().size()).sum();

        BigDecimal revenueConfirmed = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CONFIRMED || o.getStatus() == OrderStatus.PARTIALLY_CANCELLED)
                .map(Order::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal revenueEstimated = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> scansByShow = scans.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        scan -> scan.getShowId() == null ? "unknown" : scan.getShowId(),
                        java.util.stream.Collectors.counting()
                ));

        Map<String, List<Order>> byShow = orders.stream()
                .collect(java.util.stream.Collectors.groupingBy(o -> o.getShowId() == null ? "unknown" : o.getShowId()));

        List<AdminMetricsResponse.EventMetrics> perEventMetrics = byShow.entrySet().stream()
                .map(entry -> {
                    List<Order> showOrders = entry.getValue();
                    Order sample = showOrders.get(0);
                    long showConfirmed = showOrders.stream().filter(o -> o.getStatus() == OrderStatus.CONFIRMED).count();
                    long showPending = showOrders.stream().filter(o -> o.getStatus() == OrderStatus.PAYMENT_PENDING).count();
                    long showCancelled = showOrders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();
                    long showPartiallyCancelled = showOrders.stream().filter(o -> o.getStatus() == OrderStatus.PARTIALLY_CANCELLED).count();
                    BigDecimal showRevenue = showOrders.stream()
                            .filter(o -> o.getStatus() == OrderStatus.CONFIRMED || o.getStatus() == OrderStatus.PARTIALLY_CANCELLED)
                            .map(Order::getAmount)
                            .filter(java.util.Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal showRevenueEstimated = showOrders.stream()
                            .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                            .map(Order::getAmount)
                            .filter(java.util.Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    long activeTickets = showOrders.stream()
                            .mapToLong(o -> o.getSeatIds() == null ? 0 : o.getSeatIds().size())
                            .sum();
                    return AdminMetricsResponse.EventMetrics.builder()
                            .showId(entry.getKey())
                            .showTitle(sample.getShowTitle() == null ? "Unknown show" : sample.getShowTitle())
                            .totalOrders(showOrders.size())
                            .confirmedOrders(showConfirmed)
                            .pendingOrders(showPending)
                            .cancelledOrders(showCancelled)
                            .partiallyCancelledOrders(showPartiallyCancelled)
                            .activeTickets(activeTickets)
                            .scansSuccessful(scansByShow.getOrDefault(entry.getKey(), 0L))
                            .revenueEstimated(showRevenueEstimated)
                            .revenue(showRevenue)
                            .build();
                })
                .sorted(Comparator.comparing(AdminMetricsResponse.EventMetrics::getRevenue).reversed())
                .toList();

        List<AdminMetricsResponse.EventMetrics> topEventsByRevenue = perEventMetrics.stream()
                .limit(5)
                .toList();

        return AdminMetricsResponse.builder()
                .windowDays(windowDays)
                .global(AdminMetricsResponse.GlobalMetrics.builder()
                        .totalOrders(orders.size())
                        .confirmedOrders(confirmed)
                        .pendingOrders(pending)
                        .cancelledOrders(cancelled)
                        .partiallyCancelledOrders(partial)
                        .ticketsActive(ticketsActive)
                        .scansSuccessful(scans.size())
                        .revenueConfirmed(revenueConfirmed)
                        .revenueEstimated(revenueEstimated)
                        .build())
                .perEventMetrics(perEventMetrics)
                .topEventsByRevenue(topEventsByRevenue)
                .build();
    }

    private Order requireUserOrder(String userId, String orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> ResourceNotFoundException.forResource("Order", orderId));
    }

    private void ensureOrderCanBeCancelled(Order order) {
        if (!cancellationPolicyProperties.isEnabled()) {
            throw new BadRequestException("Order cancellation is currently disabled");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }
        String startTime = order.getStartTime();
        if (startTime == null || startTime.isBlank()) {
            return;
        }
        try {
            java.time.Instant eventStart = java.time.Instant.parse(startTime);
            java.time.Instant now = java.time.Instant.now();
            if (!eventStart.isAfter(now)) {
                throw new BadRequestException("Order cannot be cancelled after event start time");
            }
            int cutoffHours = Math.max(cancellationPolicyProperties.getCutoffHours(), 0);
            java.time.Instant cutoffTime = eventStart.minus(java.time.Duration.ofHours(cutoffHours));
            if (now.isAfter(cutoffTime)) {
                throw new BadRequestException(
                        "Order can only be cancelled until %d hours before event start".formatted(cutoffHours)
                );
            }
        } catch (java.time.format.DateTimeParseException ignored) {
            // Keep permissive behavior when legacy data has non-ISO time format.
        }
    }

    private OrderStatus resolveStatusAfterSeatCancellation(OrderStatus currentStatus, Set<String> remainingSeats) {
        if (remainingSeats.isEmpty()) {
            return OrderStatus.CANCELLED;
        }
        if (currentStatus == OrderStatus.PAYMENT_PENDING) {
            return OrderStatus.PAYMENT_PENDING;
        }
        return OrderStatus.PARTIALLY_CANCELLED;
    }

    private ScanTicketResponse invalidScan(String orderId, String seatId, String showId, String message) {
        return ScanTicketResponse.builder()
                .result(ScanTicketResult.INVALID)
                .message(message)
                .orderId(orderId)
                .seatId(seatId)
                .showId(showId)
                .build();
    }
}
