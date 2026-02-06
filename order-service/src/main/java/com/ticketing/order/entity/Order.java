package com.ticketing.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

/**
 * Order entity - stored in PostgreSQL.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @Column(length = 36)
    private String id;

    private String holdId;
    private String showId;

    @JdbcTypeCode(SqlTypes.JSON)
    private Set<String> seatIds;

    private String userId;
    private BigDecimal amount;
    private String currency;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private Instant createdAt;
}
