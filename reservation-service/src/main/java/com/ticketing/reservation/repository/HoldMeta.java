package com.ticketing.reservation.repository;

import java.util.Set;

public record HoldMeta(String holdId, String showId, Set<String> seatIds) {}
