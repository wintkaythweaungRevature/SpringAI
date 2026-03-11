package com.example;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Add this to your Spring Boot project.
 * Requires: spring-boot-starter-security, jjwt (JWT library)
 *
 * Add to pom.xml:
 * <dependency>
 *   <groupId>org.springframework.boot</groupId>
 *   <artifactId>spring-boot-starter-security</artifactId>
 * </dependency>
 * <dependency>
 *   <groupId>io.jsonwebtoken</groupId>
 *   <artifactId>jjwt-api</artifactId>
 *   <version>0.12.3</version>
 * </dependency>
 * <dependency>
 *   <groupId>io.jsonwebtoken</groupId>
 *   <artifactId>jjwt-impl</artifactId>
 *   <version>0.12.3</version>
 *   <scope>runtime</scope>
 * </dependency>
 * <dependency>
 *   <groupId>io.jsonwebtoken</groupId>
 *   <artifactId>jjwt-jackson</artifactId>
 *   <version>0.12.3</version>
 *   <scope>runtime</scope>
 * </dependency>
 */
@CrossOrigin(origins = {
    "http://localhost:3000", "https://www.wintaibot.com", "https://wintaibot.com",
    "https://api.wintaibot.com", "https://main.dk6jk3fcod2l.amplifyapp.com"
}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
@RequestMapping("/api/auth")
@RestController
public class AuthController {

    // In-memory store for demo - use JPA/DB in production
    private static final Map<String, UserRecord> USERS = new ConcurrentHashMap<>();
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String name = body.getOrDefault("name", "");

        if (email == null || password == null || email.isBlank() || password.length() < 6)
            return ResponseEntity.badRequest().body("Email and password (min 6 chars) required");

        if (USERS.containsKey(email.toLowerCase()))
            return ResponseEntity.badRequest().body("Email already registered");

        UserRecord u = new UserRecord(
            UUID.randomUUID().toString(),
            email.toLowerCase(),
            passwordEncoder.encode(password),
            name,
            true  // subscriptionActive - set true for new signups (or false to require activation)
        );
        USERS.put(email.toLowerCase(), u);

        String token = jwtService.createToken(u.id, u.email);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userToMap(u));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null)
            return ResponseEntity.badRequest().body("Email and password required");

        UserRecord u = USERS.get(email.toLowerCase());
        if (u == null || !passwordEncoder.matches(password, u.passwordHash))
            return ResponseEntity.status(401).body("Invalid email or password");

        String token = jwtService.createToken(u.id, u.email);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userToMap(u));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String auth) {
        if (auth == null || !auth.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Unauthorized");
        String token = auth.substring(7);
        try {
            String userId = jwtService.getUserId(token);
            Optional<UserRecord> u = USERS.values().stream()
                .filter(x -> x.id.equals(userId)).findFirst();
            if (u.isEmpty()) return ResponseEntity.status(404).body("User not found");
            return ResponseEntity.ok(userToMap(u.get()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    private Map<String, Object> userToMap(UserRecord u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.id);
        m.put("email", u.email);
        m.put("name", u.name);
        m.put("subscriptionActive", u.subscriptionActive);
        return m;
    }

    record UserRecord(String id, String email, String passwordHash, String name, boolean subscriptionActive) {}
}
