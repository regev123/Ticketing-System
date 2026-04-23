package com.ticketing.auth.controller;

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
import com.ticketing.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthTokensResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public AuthTokensResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authService.logout(authorization);
    }

    @PostMapping("/verify-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
    }

    @PostMapping("/resend-verification")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request);
    }

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public MeResponse me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return authService.me(authorization);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.OK)
    public AuthTokensResponse changePassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        return authService.changePassword(authorization, request);
    }

    @GetMapping("/admin/scanners")
    @ResponseStatus(HttpStatus.OK)
    public List<ScannerAccountResponse> listScanners(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return authService.listScannerAccounts(authorization);
    }

    @PostMapping("/admin/scanners")
    @ResponseStatus(HttpStatus.CREATED)
    public ScannerAccountResponse createScanner(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody AdminCreateScannerRequest request
    ) {
        return authService.createScannerAccount(authorization, request);
    }

    @PostMapping("/admin/scanners/{scannerId}/disable")
    @ResponseStatus(HttpStatus.OK)
    public ScannerAccountResponse disableScanner(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("scannerId") String scannerId
    ) {
        return authService.disableScannerAccount(authorization, scannerId);
    }

    @PostMapping("/admin/scanners/{scannerId}/reset-password")
    @ResponseStatus(HttpStatus.OK)
    public ScannerAccountResponse resetScannerPassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("scannerId") String scannerId,
            @Valid @RequestBody AdminResetScannerPasswordRequest request
    ) {
        return authService.resetScannerPassword(authorization, scannerId, request);
    }
}
