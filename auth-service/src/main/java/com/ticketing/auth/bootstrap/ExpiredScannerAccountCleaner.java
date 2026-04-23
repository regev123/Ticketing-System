package com.ticketing.auth.bootstrap;

import com.ticketing.auth.entity.UserRole;
import com.ticketing.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpiredScannerAccountCleaner {

    private final UserRepository userRepository;

    @Scheduled(fixedDelayString = "${auth.seed.default-scanner.cleanup-interval-ms:3600000}")
    public void cleanupExpiredScanners() {
        var expired = userRepository.findByRoleAndScannerEventEndAtBefore(UserRole.SCANNER, Instant.now());
        if (expired.isEmpty()) return;
        userRepository.deleteAll(expired);
        log.info("Deleted {} expired scanner account(s)", expired.size());
    }
}
