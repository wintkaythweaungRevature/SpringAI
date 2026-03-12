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
        // #region agent log
        try {
            java.nio.file.Path p = java.nio.file.Paths.get(System.getProperty("user.dir")).resolve("debug-515b60.log");
            String line = "{\"sessionId\":\"515b60\",\"location\":\"AuthController.login:entry\",\"message\":\"request received\",\"data\":{\"emailPresent\":\"" + (req.getEmail() != null) + "\"},\"timestamp\":" + System.currentTimeMillis() + ",\"hypothesisId\":\"D\"}\n";
            java.nio.file.Files.writeString(p, line, java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
        } catch (Exception ignored) {}
        // #endregion
        LoginResponse res = authService.login(req);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Registration successful. Please check your email to verify your account."));
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
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        String password = body != null ? body.get("password") : null;
        authService.deactivate(userId, password);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Account deactivated successfully"));
    }

    @PostMapping("/reactivate")
    public ResponseEntity<LoginResponse> reactivate(@Valid @RequestBody LoginRequest req) {
        LoginResponse res = authService.reactivate(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(res);
    }
}
