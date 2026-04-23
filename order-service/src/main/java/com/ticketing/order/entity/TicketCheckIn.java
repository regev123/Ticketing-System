package com.ticketing.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "ticket_check_ins",
        uniqueConstraints = @UniqueConstraint(name = "uk_ticket_check_in_order_seat", columnNames = {"order_id", "seat_id"})
)
@Getter
@Setter
@NoArgsConstructor
public class TicketCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, length = 64)
    private String orderId;

    @Column(name = "seat_id", nullable = false, length = 128)
    private String seatId;

    @Column(name = "show_id", length = 64)
    private String showId;

    @Column(name = "gate_id", length = 64)
    private String gateId;

    @Column(name = "scanned_at", nullable = false)
    private Instant scannedAt;
}
