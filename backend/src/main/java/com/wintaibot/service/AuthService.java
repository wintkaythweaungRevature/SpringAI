package com.wintaibot.service;

import com.wintaibot.dto.LoginRequest;
import com.wintaibot.dto.LoginResponse;
import com.wintaibot.dto.MeResponse;
import com.wintaibot.dto.RegisterRequest;
import com.wintaibot.entity.User;
import com.wintaibot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final StripeSubscriptionService stripeService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, @Autowired(required = false) EmailService emailService,
                       @Autowired(required = false) StripeSubscriptionService stripeService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.stripeService = stripeService;
    }

    public LoginResponse login(LoginRequest req) {
        // #region agent log
        String email = (req.getEmail() != null) ? req.getEmail().trim().toLowerCase() : "";
        dbg("AuthService.login:entry", "A,D", Map.of("emailLen", email.length(), "emailDomain", email.contains("@") ? email.substring(Math.max(0, email.indexOf("@") + 1)) : ""));
        // #endregion
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        // #region agent log
        dbg("AuthService.login:userLookup", "A", Map.of("userFound", userOpt.isPresent()));
        // #endregion
        User user = userOpt.orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.isDeactivated()) {
            // #region agent log
            dbg("AuthService.login:deactivated", "E", Map.of("userId", user.getId()));
            // #endregion
            throw new RuntimeException("Account has been deactivated");
        }

        String rawPassword = req.getPassword();
        String storedHash = user.getPasswordHash();
        // #region agent log
        String hashPrefix = (storedHash != null && storedHash.length() >= 10) ? storedHash.substring(0, 10) : (storedHash != null ? storedHash : "null");
        dbg("AuthService.login:beforeMatch", "B,C", Map.of("hashLen", storedHash != null ? storedHash.length() : 0, "hashPrefix", hashPrefix, "isBcrypt", isBcryptHash(storedHash != null ? storedHash : "")));
        // #endregion
        boolean matched = passwordMatches(rawPassword, storedHash);
        // #region agent log
        dbg("AuthService.login:matchResult", "B,C", Map.of("matched", matched));
        // #endregion
        if (!matched) {
            throw new RuntimeException("Invalid email or password");
        }

        // Migrate legacy (non-BCrypt) passwords to BCrypt on successful login
        if (storedHash != null && !isBcryptHash(storedHash) && rawPassword != null) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new LoginResponse(
                token,
                user.getEmail(),
                user.getMembershipType().name(),
                user.getId(),
                user.isEmailVerified()
        );
    }

    public void register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        String name = req.getName() != null ? req.getName() : (req.getFirstName() != null ? req.getFirstName() : "");
        user.setFirstName(name);
        user.setLastName(req.getLastName());
        user.setMembershipType(User.MembershipType.FREE);
        user.setEmailVerified(false);
        user.setEmailVerificationToken(generateToken());

        userRepository.save(user);

        if (emailService != null) {
            try {
                emailService.sendVerificationEmail(user.getEmail(), user.getEmailVerificationToken());
            } catch (Exception e) {
                // Log but don't fail registration
            }
        }
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    public Optional<MeResponse> getMe(Long userId) {
        return userRepository.findById(userId)
                .filter(u -> !u.isDeactivated())
                .map(MeResponse::new);
    }

    public void deactivate(Long userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (password != null && !password.isBlank() && !passwordMatches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }
        if (stripeService != null && user.getStripeSubscriptionId() != null) {
            try {
                stripeService.cancelSubscription(user.getStripeSubscriptionId());
            } catch (Exception e) {
                // Log but continue - we still deactivate the account
            }
        }
        user.setDeactivated(true);
        user.setMembershipType(User.MembershipType.FREE);
        user.setStripeSubscriptionId(null);
        userRepository.save(user);
    }

    public LoginResponse reactivate(String email, String password) {
        String emailNorm = (email != null) ? email.trim().toLowerCase() : "";
        User user = userRepository.findByEmailIgnoreCase(emailNorm)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if (!user.isDeactivated()) {
            throw new RuntimeException("Account is already active");
        }
        if (!passwordMatches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        user.setDeactivated(false);
        userRepository.save(user);
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new LoginResponse(
                token,
                user.getEmail(),
                user.getMembershipType().name(),
                user.getId(),
                user.isEmailVerified()
        );
    }

    private String generateToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean isBcryptHash(String hash) {
        return hash != null && hash.length() == 60
                && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
    }

    private boolean passwordMatches(String rawPassword, String storedHash) {
        if (storedHash == null || rawPassword == null) return false;
        if (isBcryptHash(storedHash)) {
            return passwordEncoder.matches(rawPassword, storedHash);
        }
        // Legacy: plain text (migrate to BCrypt on successful login)
        return rawPassword.equals(storedHash);
    }

    private void dbg(String location, String hypothesisId, Map<String, Object> data) {
        try {
            StringBuilder sb = new StringBuilder();
            for (Map.Entry<String, Object> e : data.entrySet()) {
                if (sb.length() > 0) sb.append(",");
                sb.append("\"").append(e.getKey().replace("\"", "\\\"")).append("\":");
                Object v = e.getValue();
                if (v instanceof Boolean) sb.append(v);
                else if (v instanceof Number) sb.append(v);
                else sb.append("\"").append(String.valueOf(v).replace("\\", "\\\\").replace("\"", "\\\"")).append("\"");
            }
            Path p = Paths.get(System.getProperty("user.dir")).resolve("debug-515b60.log");
            String line = "{\"sessionId\":\"515b60\",\"location\":\"" + location + "\",\"message\":\"login debug\",\"data\":{" + sb + "},\"timestamp\":" + System.currentTimeMillis() + ",\"hypothesisId\":\"" + hypothesisId + "\"}\n";
            Files.writeString(p, line, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception ignored) {}
    }
}
