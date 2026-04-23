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
public class DefaultAdminUserInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DefaultAdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${auth.seed.default-admin.enabled:true}")
    private boolean enabled;

    @Value("${auth.seed.default-admin.email:admin@ticketing.local}")
    private String adminEmail;

    @Value("${auth.seed.default-admin.password:Admin123!}")
    private String adminPassword;

    @Value("${auth.seed.default-admin.first-name:Default}")
    private String firstName;

    @Value("${auth.seed.default-admin.last-name:Admin}")
    private String lastName;

    public DefaultAdminUserInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        String normalizedEmail = normalizeEmail(adminEmail);
        if (normalizedEmail.isBlank()) {
            log.warn("Skipping default admin seeding: email is blank");
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("Skipping default admin seeding for {}: password is blank", normalizedEmail);
            return;
        }

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return;
        }

        Instant now = Instant.now();
        User admin = new User();
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        admin.setEmailVerified(true);
        admin.setCreatedAt(now);
        admin.setUpdatedAt(now);
        admin.setTokenVersion(0);
        admin.setFirstName(trimToNull(firstName));
        admin.setLastName(trimToNull(lastName));

        userRepository.save(admin);
        log.info("Seeded default admin user: {}", normalizedEmail);
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
