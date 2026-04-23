package com.ticketing.auth.service;

import com.ticketing.auth.dto.AuthTokensResponse;
import com.ticketing.auth.dto.AdminCreateScannerRequest;
import com.ticketing.auth.dto.AdminResetScannerPasswordRequest;
import com.ticketing.auth.dto.ChangePasswordRequest;
import com.ticketing.auth.dto.LoginRequest;
import com.ticketing.auth.dto.MeResponse;
import com.ticketing.auth.dto.ResendVerificationRequest;
import com.ticketing.auth.dto.RegisterRequest;
import com.ticketing.auth.dto.ScannerAccountResponse;
import com.ticketing.auth.dto.VerifyEmailRequest;
import com.ticketing.auth.entity.EmailVerificationToken;
import com.ticketing.auth.entity.User;
import com.ticketing.auth.entity.UserRole;
import com.ticketing.auth.repository.EmailVerificationTokenRepository;
import com.ticketing.auth.repository.UserRepository;
import com.ticketing.auth.security.JwtTokenService;
import com.ticketing.common.exception.BadRequestException;
import com.ticketing.common.exception.ForbiddenException;
import com.ticketing.common.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.time.format.DateTimeParseException;

@Service
public class AuthService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final JwtTokenService jwtTokenService;
    private final VerificationEmailService verificationEmailService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${auth.verification.token-ttl-seconds:86400}")
    private long verificationTokenTtlSeconds;

    public AuthService(
            UserRepository userRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            JwtTokenService jwtTokenService,
            VerificationEmailService verificationEmailService
    ) {
        this.userRepository = userRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.jwtTokenService = jwtTokenService;
        this.verificationEmailService = verificationEmailService;
    }

    public AuthTokensResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER);
        user.setActive(true);
        user.setEmailVerified(false);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user.setTokenVersion(0);
        user.setFirstName(trimToNull(request.firstName()));
        user.setLastName(trimToNull(request.lastName()));
        user = userRepository.save(user);
        issueAndSendVerificationToken(user);

        return new AuthTokensResponse(
                jwtTokenService.issueToken(user)
        );
    }

    public AuthTokensResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Email or password is incorrect"));
        if (!user.isActive()) {
            throw new ForbiddenException("Account is disabled");
        }
        if (user.getRole() == UserRole.USER && !user.isEmailVerified()) {
            throw new ForbiddenException("Email is not verified");
        }
        if (user.getRole() == UserRole.SCANNER && user.getScannerEventEndAt() != null
                && !user.getScannerEventEndAt().isAfter(Instant.now())) {
            userRepository.delete(user);
            throw new ForbiddenException("Scanner account expired");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email or password is incorrect");
        }
        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);
        return new AuthTokensResponse(
                jwtTokenService.issueToken(user)
        );
    }

    public void logout(String bearerToken) {
        Claims claims = parseAccessClaims(bearerToken);
        User user = userRepository.findById(claims.getSubject()).orElseThrow(() -> new UnauthorizedException("User not found"));
        user.setTokenVersion(user.getTokenVersion() + 1);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    public MeResponse me(String bearerToken) {
        Claims claims = parseAccessClaims(bearerToken);
        int tokenVersion = readTokenVersion(claims);
        User user = userRepository.findById(claims.getSubject()).orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!user.isActive()) throw new ForbiddenException("Account is disabled");
        if (user.getTokenVersion() != tokenVersion) {
            throw new UnauthorizedException("Token is no longer valid");
        }
        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                user.isEmailVerified(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    public AuthTokensResponse changePassword(String bearerToken, ChangePasswordRequest request) {
        Claims claims = parseAccessClaims(bearerToken);
        int tokenVersion = readTokenVersion(claims);
        User user = userRepository.findById(claims.getSubject()).orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!user.isActive()) {
            throw new ForbiddenException("Account is disabled");
        }
        if (user.getTokenVersion() != tokenVersion) {
            throw new UnauthorizedException("Token is no longer valid");
        }
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from your current password");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);
        return new AuthTokensResponse(
                jwtTokenService.issueToken(user)
        );
    }

    public void verifyEmail(VerifyEmailRequest request) {
        EmailVerificationToken token = emailVerificationTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        if (token.getUsedAt() != null) {
            throw new BadRequestException("Verification token already used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Verification token has expired");
        }
        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
        }
        token.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(token);
        emailVerificationTokenRepository.deleteByUserId(user.getId());
    }

    public void resendVerification(ResendVerificationRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User with email does not exist"));
        if (!user.isActive()) {
            throw new ForbiddenException("Account is disabled");
        }
        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        issueAndSendVerificationToken(user);
    }

    public List<ScannerAccountResponse> listScannerAccounts(String bearerToken) {
        requireAdminUser(bearerToken);
        return userRepository.findByRoleOrderByCreatedAtDesc(UserRole.SCANNER)
                .stream()
                .map(this::toScannerAccountResponse)
                .toList();
    }

    public ScannerAccountResponse createScannerAccount(String bearerToken, AdminCreateScannerRequest request) {
        requireAdminUser(bearerToken);
        Instant eventEndAt = parseScannerEventEndAt(request.eventEndAt());
        if (!eventEndAt.isAfter(Instant.now())) {
            throw new BadRequestException("eventEndAt must be in the future");
        }
        String email = generateScannerEmail(request.showId());
        if (userRepository.findByEmail(email).isPresent()) {
            email = generateScannerEmail(request.showId());
        }
        String generatedPassword = generateScannerPassword();
        User scanner = new User();
        scanner.setEmail(email);
        scanner.setPasswordHash(passwordEncoder.encode(generatedPassword));
        scanner.setRole(UserRole.SCANNER);
        scanner.setActive(true);
        scanner.setEmailVerified(true);
        scanner.setCreatedAt(Instant.now());
        scanner.setUpdatedAt(Instant.now());
        scanner.setTokenVersion(0);
        scanner.setFirstName(trimToNull(request.scannerName()));
        scanner.setLastName("Scanner");
        scanner.setScannerEventId(request.showId().trim());
        scanner.setScannerEventTitle(trimToNull(request.showTitle()));
        scanner.setScannerEventEndAt(eventEndAt);
        scanner = userRepository.save(scanner);
        return toScannerAccountResponse(scanner, generatedPassword);
    }

    public ScannerAccountResponse disableScannerAccount(String bearerToken, String scannerId) {
        requireAdminUser(bearerToken);
        User scanner = userRepository.findById(scannerId).orElseThrow(() -> new BadRequestException("Scanner user not found"));
        if (scanner.getRole() != UserRole.SCANNER) {
            throw new BadRequestException("Target user is not a scanner account");
        }
        scanner.setActive(false);
        scanner.setTokenVersion(scanner.getTokenVersion() + 1);
        scanner.setUpdatedAt(Instant.now());
        scanner = userRepository.save(scanner);
        return toScannerAccountResponse(scanner, null);
    }

    public ScannerAccountResponse resetScannerPassword(
            String bearerToken,
            String scannerId,
            AdminResetScannerPasswordRequest request
    ) {
        requireAdminUser(bearerToken);
        User scanner = userRepository.findById(scannerId).orElseThrow(() -> new BadRequestException("Scanner user not found"));
        if (scanner.getRole() != UserRole.SCANNER) {
            throw new BadRequestException("Target user is not a scanner account");
        }
        scanner.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        scanner.setTokenVersion(scanner.getTokenVersion() + 1);
        scanner.setUpdatedAt(Instant.now());
        scanner = userRepository.save(scanner);
        return toScannerAccountResponse(scanner, null);
    }

    private Claims parseAccessClaims(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing bearer token");
        }
        return jwtTokenService.parse(bearerToken.substring("Bearer ".length()));
    }

    private static int readTokenVersion(Claims claims) {
        Object raw = claims.get("tokenVersion");
        if (raw instanceof Number number) {
            return number.intValue();
        }
        throw new UnauthorizedException("Invalid token payload");
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private User requireAdminUser(String bearerToken) {
        Claims claims = parseAccessClaims(bearerToken);
        int tokenVersion = readTokenVersion(claims);
        User user = userRepository.findById(claims.getSubject()).orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!user.isActive()) {
            throw new ForbiddenException("Account is disabled");
        }
        if (user.getTokenVersion() != tokenVersion) {
            throw new UnauthorizedException("Token is no longer valid");
        }
        if (user.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Admin role is required");
        }
        return user;
    }

    private ScannerAccountResponse toScannerAccountResponse(User user) {
        return toScannerAccountResponse(user, null);
    }

    private ScannerAccountResponse toScannerAccountResponse(User user, String temporaryPassword) {
        return new ScannerAccountResponse(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                user.getFirstName(),
                user.getLastName(),
                user.getScannerEventId(),
                user.getScannerEventTitle(),
                user.getScannerEventEndAt(),
                temporaryPassword,
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }

    private static Instant parseScannerEventEndAt(String raw) {
        try {
            return Instant.parse(raw);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("eventEndAt must be a valid ISO-8601 UTC datetime");
        }
    }

    private static String generateScannerEmail(String showId) {
        String compactShow = showId == null ? "event" : showId.replaceAll("[^a-zA-Z0-9]", "").toLowerCase(Locale.ROOT);
        if (compactShow.isBlank()) compactShow = "event";
        String suffix = Long.toHexString(Math.abs(SECURE_RANDOM.nextLong()));
        return "scanner-" + compactShow + "-" + suffix.substring(0, Math.min(6, suffix.length())) + "@ticketing.io";
    }

    private static String generateScannerPassword() {
        byte[] bytes = new byte[9];
        SECURE_RANDOM.nextBytes(bytes);
        return "Scn-" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void issueAndSendVerificationToken(User user) {
        emailVerificationTokenRepository.deleteByUserId(user.getId());

        EmailVerificationToken token = new EmailVerificationToken();
        token.setToken(generateSecureToken());
        token.setUserId(user.getId());
        token.setEmail(user.getEmail());
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plusSeconds(verificationTokenTtlSeconds));
        token.setUsedAt(null);
        emailVerificationTokenRepository.save(token);

        verificationEmailService.sendVerificationEmail(user.getEmail(), token.getToken());
    }

    private static String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
