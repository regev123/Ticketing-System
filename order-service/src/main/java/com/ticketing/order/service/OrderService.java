package com.ticketing.order.service;

import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;
import com.ticketing.order.dto.PagedResponse;
import com.ticketing.order.dto.AdminMetricsResponse;
import com.ticketing.order.dto.ScanTicketResponse;
import com.ticketing.common.auth.AuthPrincipal;

import java.util.Set;

/**
 * Service interface for order operations.
 * DIP: controller depends on abstraction.
 */
public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request, String userId);

    PagedResponse<OrderResponse> getMyOrders(String userId, int page, int size);

    OrderResponse getMyOrderById(String userId, String orderId);

    OrderResponse cancelMyOrderSeats(String userId, String orderId, Set<String> seatIds);

    OrderResponse cancelMyOrder(String userId, String orderId);

    byte[] getMyTicketPdf(String userId, String orderId, String seatId);

    ScanTicketResponse scanTicket(String qrToken, String gateId, AuthPrincipal principal);

    AdminMetricsResponse getAdminMetrics(int days);

    /**
     * Seat IDs tied to active orders (payment pending or confirmed) for this show.
     */
    Set<String> getUnavailableSeatIdsForShow(String showId);
}
