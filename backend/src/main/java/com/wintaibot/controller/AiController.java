package com.wintaibot.controller;

import com.wintaibot.entity.User;
import com.wintaibot.repository.UserRepository;
import com.wintaibot.service.AiService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository;

    public AiController(AiService aiService, UserRepository userRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    // Check if authenticated user has MEMBER subscription
    private boolean isMember(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) return false;
        Long userId = (Long) auth.getPrincipal();
        return userRepository.findById(userId)
                .map(u -> u.getMembershipType() == User.MembershipType.MEMBER)
                .orElse(false);
    }

    private ResponseEntity<?> memberRequired() {
        return ResponseEntity.status(403).body(Map.of(
                "requiresSubscription", true,
                "message", "This feature requires a Member subscription ($5.99/month). Please upgrade to continue."
        ));
    }

    // Status
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "openaiConfigured", aiService.isOpenAiConfigured(),
                "model", aiService.getOpenaiModel()
        ));
    }

    // Ask AI — requires login only (free)
    @GetMapping(value = "/ask-ai", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> askAi(Authentication auth,
                                         @RequestParam("prompt") String prompt) {
        if (auth == null) return ResponseEntity.status(401).body("Authentication required");
        try {
            return ResponseEntity.ok(aiService.askAi(prompt));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Generate Image — member only
    @GetMapping("/generate-image")
    public ResponseEntity<?> generateImage(Authentication auth,
                                            @RequestParam("prompt") String prompt) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        if (!isMember(auth)) return memberRequired();
        try {
            String url = aiService.generateImage(prompt);
            return ResponseEntity.ok(Collections.singletonMap("url", url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Transcribe Audio — member only
    @PostMapping("/transcribe")
    public ResponseEntity<?> transcribe(Authentication auth,
                                         @RequestParam("file") MultipartFile file) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        if (!isMember(auth)) return memberRequired();
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Audio file is required"));
        try {
            String transcript = aiService.transcribeAudio(file);
            return ResponseEntity.ok(transcript);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Analyze PDF — member only
    @PostMapping("/analyze-pdf")
    public ResponseEntity<?> analyzePdf(Authentication auth,
                                         @RequestParam("file") MultipartFile file,
                                         @RequestParam(value = "prompt", defaultValue = "") String prompt) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        if (!isMember(auth)) return memberRequired();
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "PDF file is required"));
        try {
            Map<String, Object> result = aiService.analyzePdf(file, prompt);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Email Reply — member only
    @PostMapping("/reply")
    public ResponseEntity<?> reply(Authentication auth,
                                    @RequestBody Map<String, String> payload) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        if (!isMember(auth)) return memberRequired();
        String emailContent = payload.get("emailContent");
        String tone = payload.get("tone");
        if (emailContent == null || emailContent.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "emailContent is required"));
        }
        try {
            String reply = aiService.generateEmailReply(emailContent, tone);
            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Interview Prep — member only
    @PostMapping("/prepare-interview")
    public ResponseEntity<?> prepareInterview(Authentication auth,
                                               @RequestParam("file") MultipartFile file,
                                               @RequestParam(value = "jd", required = false) String jd) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        if (!isMember(auth)) return memberRequired();
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "PDF file is required"));
        if (jd == null || jd.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "Job description (jd) is required"));
        try {
            Map<String, Object> result = aiService.prepareInterview(file, jd);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Internal server error"));
        }
    }
}
