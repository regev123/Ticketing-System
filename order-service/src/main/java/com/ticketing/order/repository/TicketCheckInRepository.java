package com.ticketing.order.repository;

import com.ticketing.order.entity.TicketCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.time.Instant;
import java.util.List;

public interface TicketCheckInRepository extends JpaRepository<TicketCheckIn, Long> {
    Optional<TicketCheckIn> findByOrderIdAndSeatId(String orderId, String seatId);
    List<TicketCheckIn> findByScannedAtAfter(Instant scannedAt);
}
