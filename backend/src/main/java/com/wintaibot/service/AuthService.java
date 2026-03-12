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

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, @Autowired(required = false) EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
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
                .map(MeResponse::new);
    }

    private String generateToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
