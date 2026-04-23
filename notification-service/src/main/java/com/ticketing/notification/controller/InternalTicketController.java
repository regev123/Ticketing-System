package com.ticketing.notification.controller;

import com.ticketing.notification.service.TicketPdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications/internal")
@RequiredArgsConstructor
public class InternalTicketController {

    private final TicketPdfGenerator ticketPdfGenerator;

    @GetMapping("/tickets/pdf")
    public ResponseEntity<byte[]> generateTicketPdf(
            @RequestParam("orderId") String orderId,
            @RequestParam("seatId") String seatId,
            @RequestParam(value = "showId", required = false) String showId,
            @RequestParam(value = "showTitle", required = false) String showTitle,
            @RequestParam(value = "venueName", required = false) String venueName,
            @RequestParam(value = "startTime", required = false) String startTime) {
        byte[] pdf = ticketPdfGenerator.generateTicketPdf(orderId, seatId, showId, showTitle, venueName, startTime);
        String filename = "ticket-%s-%s.pdf".formatted(orderId, seatId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}
