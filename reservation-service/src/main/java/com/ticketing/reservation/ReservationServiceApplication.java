package com.ticketing.reservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Reservation service entry point.
 * Manages seat holds with Redis locks (SET NX PX) for anti-double-booking.
 */
@SpringBootApplication(scanBasePackages = {"com.ticketing.reservation", "com.ticketing.common"})
public class ReservationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReservationServiceApplication.class, args);
    }
}
