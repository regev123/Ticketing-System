package com.ticketing.auth.bootstrap;

import com.ticketing.auth.entity.User;
import com.ticketing.auth.entity.UserRole;
import com.ticketing.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Locale;

@Component
public class DefaultScannerUserInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DefaultScannerUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${auth.seed.default-scanner.enabled:true}")
    private boolean enabled;

    @Value("${auth.seed.default-scanner.email:scanner@ticketing.local}")
    private String scannerEmail;

    @Value("${auth.seed.default-scanner.password:Scanner123!}")
    private String scannerPassword;

    @Value("${auth.seed.default-scanner.first-name:Default}")
    private String firstName;

    @Value("${auth.seed.default-scanner.last-name:Scanner}")
    private String lastName;

    public DefaultScannerUserInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) return;

        String normalizedEmail = normalizeEmail(scannerEmail);
        if (normalizedEmail.isBlank()) {
            log.warn("Skipping default scanner seeding: email is blank");
            return;
        }
        if (scannerPassword == null || scannerPassword.isBlank()) {
            log.warn("Skipping default scanner seeding for {}: password is blank", normalizedEmail);
            return;
        }
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return;
        }

        Instant now = Instant.now();
        User scanner = new User();
        scanner.setEmail(normalizedEmail);
        scanner.setPasswordHash(passwordEncoder.encode(scannerPassword));
        scanner.setRole(UserRole.SCANNER);
        scanner.setActive(true);
        scanner.setEmailVerified(true);
        scanner.setCreatedAt(now);
        scanner.setUpdatedAt(now);
        scanner.setTokenVersion(0);
        scanner.setFirstName(trimToNull(firstName));
        scanner.setLastName(trimToNull(lastName));

        userRepository.save(scanner);
        log.info("Seeded default scanner user: {}", normalizedEmail);
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
