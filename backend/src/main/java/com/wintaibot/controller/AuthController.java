package com.wintaibot.controller;

import com.wintaibot.dto.ForgotPasswordRequest;
import com.wintaibot.dto.LoginRequest;
import com.wintaibot.dto.LoginResponse;
import com.wintaibot.dto.MeResponse;
import com.wintaibot.dto.RegisterRequest;
import com.wintaibot.dto.ResetPasswordRequest;
import com.wintaibot.service.AuthService;
import com.wintaibot.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse res = authService.login(req);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (req == null || req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Email is required"));
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Password is required and must be at least 6 characters"));
        }
        com.wintaibot.dto.RegisterResult result = authService.register(req);
        // AuthResponse shape: token=null when verification required, emailVerified=false
        var body = new java.util.HashMap<String, Object>();
        body.put("token", result.token());
        body.put("email", result.email());
        body.put("membershipType", result.membershipType());
        body.put("userId", result.userId());
        body.put("emailVerified", result.emailVerified());
        body.put("message", result.message());
        return ResponseEntity.ok().body(body);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok().body(java.util.Map.of(
                    "verified", true,
                    "message", "Email confirmed. You can sign in."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "verified", false,
                    "error", e.getMessage() != null ? e.getMessage() : "Invalid or expired verification token"));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody java.util.Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Email is required"));
        }
        authService.resendVerificationEmail(email);
        // Always generic for privacy (don't reveal if account exists or is already verified)
        return ResponseEntity.ok().body(java.util.Map.of("message", "If the account exists, a verification email has been sent."));
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        return authService.getMe(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).build());
    }

    @PostMapping("/deactivate")
    public ResponseEntity<?> deactivate(@RequestBody(required = false) java.util.Map<String, String> body,
                                       Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).build();
        }
        Object principal = auth.getPrincipal();
        if (!(principal instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) principal;
        String password = body != null ? body.get("password") : null;
        authService.deactivate(userId, password);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Account deactivated successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.getEmail());
        return ResponseEntity.ok(java.util.Map.of("message", "If an account exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully. You can now log in."));
    }

    @PostMapping("/forgot-username")
    public ResponseEntity<?> forgotUsername(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotUsername(req.getEmail());
        return ResponseEntity.ok(java.util.Map.of("message", "If that email is registered, your username has been sent to it."));
    }

    @PostMapping("/reactivate")
    public ResponseEntity<?> reactivate(@Valid @RequestBody(required = false) LoginRequest req) {
        if (req == null || req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Email is required"));
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Password is required"));
        }
        LoginResponse res = authService.reactivate(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(res);
    }
}
