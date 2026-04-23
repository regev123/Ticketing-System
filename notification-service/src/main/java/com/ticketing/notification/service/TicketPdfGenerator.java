package com.ticketing.notification.service;

import com.ticketing.common.ticket.TicketQrTokenService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class TicketPdfGenerator {
    private static final float PAGE_PADDING = 20f;
    private static final float HEADER_HEIGHT = 70f;
    private static final float QR_SIZE = 92f;
    private static final float DETAILS_START_Y = 124f;
    private static final DateTimeFormatter ISSUE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm 'UTC'", Locale.ROOT).withZone(ZoneId.of("UTC"));
    private static final DateTimeFormatter EVENT_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm 'UTC'", Locale.ROOT).withZone(ZoneId.of("UTC"));
    private final TicketQrTokenService ticketQrTokenService;
    @Value("${ticket.qr.check-in-url-base:${TICKET_QR_CHECKIN_URL_BASE:http://localhost:3000/check-in}}")
    private String checkInUrlBase;

    public byte[] generateTicketPdf(
            String orderId,
            String seatId,
            String showId,
            String showTitle,
            String venueName,
            String startTime
    ) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A6);
            document.addPage(page);

            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                PDRectangle box = page.getMediaBox();
                float pageWidth = box.getWidth();
                float pageHeight = box.getHeight();

                // Card background.
                stream.setNonStrokingColor(new Color(249, 250, 251));
                stream.addRect(PAGE_PADDING, PAGE_PADDING, pageWidth - (PAGE_PADDING * 2), pageHeight - (PAGE_PADDING * 2));
                stream.fill();

                // Header block.
                stream.setNonStrokingColor(new Color(30, 41, 59));
                stream.addRect(PAGE_PADDING, pageHeight - PAGE_PADDING - HEADER_HEIGHT, pageWidth - (PAGE_PADDING * 2), HEADER_HEIGHT);
                stream.fill();

                // Header title and subtitle.
                writeText(stream, PAGE_PADDING + 14, pageHeight - PAGE_PADDING - 26, "STAGEPASS TICKET", PDType1Font.HELVETICA_BOLD, 13, 255, 255, 255);
                writeText(stream, PAGE_PADDING + 14, pageHeight - PAGE_PADDING - 44, "Admit One - Confirmed Entry", PDType1Font.HELVETICA, 9, 226, 232, 240);

                // Seat badge.
                float seatBadgeY = pageHeight - PAGE_PADDING - HEADER_HEIGHT - 24;
                stream.setNonStrokingColor(new Color(16, 185, 129));
                stream.addRect(PAGE_PADDING + 14, seatBadgeY, 88, 18);
                stream.fill();
                writeText(stream, PAGE_PADDING + 20, seatBadgeY + 5, "SEAT " + seatId, PDType1Font.HELVETICA_BOLD, 9, 255, 255, 255);

                String reference = toOrderReference(orderId);
                writeText(stream, PAGE_PADDING + 14, seatBadgeY - 20, "Order Ref", PDType1Font.HELVETICA, 8, 71, 85, 105);
                writeText(stream, PAGE_PADDING + 14, seatBadgeY - 35, reference, PDType1Font.HELVETICA_BOLD, 14, 15, 23, 42);

                String issueTime = ISSUE_TIME_FORMATTER.format(Instant.now());
                writeText(stream, PAGE_PADDING + 14, seatBadgeY - 52, "Issued: " + issueTime, PDType1Font.HELVETICA, 8, 100, 116, 139);

                // Event details block.
                writeText(stream, PAGE_PADDING + 14, DETAILS_START_Y + 30, "EVENT DETAILS", PDType1Font.HELVETICA_BOLD, 8, 71, 85, 105);
                writeText(stream, PAGE_PADDING + 14, DETAILS_START_Y + 15, nonBlank(showTitle, "Live Event"), PDType1Font.HELVETICA_BOLD, 10, 15, 23, 42);
                writeText(stream, PAGE_PADDING + 14, DETAILS_START_Y, "Venue: " + nonBlank(venueName, "To be announced"), PDType1Font.HELVETICA, 8, 71, 85, 105);
                writeText(stream, PAGE_PADDING + 14, DETAILS_START_Y - 13, "Starts: " + formatStartTime(startTime), PDType1Font.HELVETICA, 8, 71, 85, 105);

                // QR code (right side).
                String qrPayload = buildCheckInUrl(orderId, seatId, showId);
                PDImageXObject qrImage = generateQrCodeImage(document, qrPayload, (int) QR_SIZE);
                float qrX = pageWidth - PAGE_PADDING - QR_SIZE - 14;
                float qrY = seatBadgeY - 54;
                stream.drawImage(qrImage, qrX, qrY, QR_SIZE, QR_SIZE);
                writeText(stream, qrX + 8, qrY - 10, "Scan at entry", PDType1Font.HELVETICA, 7, 71, 85, 105);

                // Divider line.
                stream.setStrokingColor(new Color(203, 213, 225));
                stream.moveTo(PAGE_PADDING + 14, PAGE_PADDING + 54);
                stream.lineTo(pageWidth - PAGE_PADDING - 14, PAGE_PADDING + 54);
                stream.stroke();

                // Footer message.
                writeText(stream, PAGE_PADDING + 14, PAGE_PADDING + 38,
                        "Please keep this ticket with you.", PDType1Font.HELVETICA_BOLD, 8, 15, 23, 42);
                writeText(stream, PAGE_PADDING + 14, PAGE_PADDING + 24,
                        "A separate ticket is issued for each seat.", PDType1Font.HELVETICA, 8, 71, 85, 105);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate ticket PDF", e);
        }
    }

    private static void writeText(
            PDPageContentStream stream,
            float x,
            float y,
            String text,
            org.apache.pdfbox.pdmodel.font.PDFont font,
            float size,
            int r,
            int g,
            int b
    ) throws IOException {
        stream.beginText();
        stream.setNonStrokingColor(new Color(r, g, b));
        stream.setFont(font, size);
        stream.newLineAtOffset(x, y);
        stream.showText(text);
        stream.endText();
    }

    private static PDImageXObject generateQrCodeImage(PDDocument document, String payload, int size) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(payload, BarcodeFormat.QR_CODE, size, size);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            return LosslessFactory.createFromImage(document, image);
        } catch (WriterException | IOException e) {
            throw new IllegalStateException("Failed to generate QR code for ticket", e);
        }
    }

    private static String toOrderReference(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            return "#N/A";
        }
        String compact = orderId.replace("-", "");
        int length = Math.min(8, compact.length());
        return "#" + compact.substring(0, length).toUpperCase(Locale.ROOT);
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    private static String nonBlank(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private static String formatStartTime(String startTime) {
        if (startTime == null || startTime.isBlank()) {
            return "To be announced";
        }
        try {
            return EVENT_TIME_FORMATTER.format(Instant.parse(startTime));
        } catch (Exception ignored) {
            return startTime;
        }
    }

    private String buildCheckInUrl(String orderId, String seatId, String showId) {
        String token = ticketQrTokenService.issueToken(safe(orderId), safe(seatId), safe(showId));
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        String base = checkInUrlBase == null ? "http://localhost:3000/check-in" : checkInUrlBase.trim();
        return base + (base.contains("?") ? "&" : "?") + "token=" + encoded;
    }
}
