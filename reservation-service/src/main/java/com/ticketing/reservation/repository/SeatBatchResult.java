package com.ticketing.reservation.repository;

import java.util.Set;

/** Partial batch hold: seats acquired or already owned by user vs taken by others. */
public record SeatBatchResult(Set<String> success, Set<String> failed) {}
