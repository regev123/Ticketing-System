package com.ticketing.reservation;

import com.ticketing.common.config.WebConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * Reservation service entry point.
 * Manages seat holds with Redis locks (SET NX PX) for anti-double-booking.
 */
@SpringBootApplication
@Import(WebConfig.class)
public class ReservationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReservationServiceApplication.class, args);
    }
}
