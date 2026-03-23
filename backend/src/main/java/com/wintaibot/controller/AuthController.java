package com.wintaibot.controller;

import com.wintaibot.dto.LoginRequest;
import com.wintaibot.dto.LoginResponse;
import com.wintaibot.dto.MeResponse;
import com.wintaibot.dto.RegisterRequest;
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
        LoginResponse res = authService.register(req);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Email verified successfully. You can now log in."));
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
