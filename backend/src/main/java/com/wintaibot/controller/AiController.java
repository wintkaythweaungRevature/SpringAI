package com.wintaibot.controller;

import com.wintaibot.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);
    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping(value = "/ask-ai", produces = {MediaType.TEXT_PLAIN_VALUE, MediaType.ALL_VALUE})
    public ResponseEntity<String> askAi(
            @RequestParam String prompt,
            Authentication auth) {
        try {
            return ResponseEntity.ok(aiService.askAi(prompt));
        } catch (Exception e) {
            log.warn("ask-ai failed: {}", e.getMessage());
            String msg = e.getMessage();
            if (msg != null && msg.contains("OPENAI_API_KEY")) {
                return ResponseEntity.status(503).body("Ask AI is not configured. Set OPENAI_API_KEY in backend.env.");
            }
            return ResponseEntity.internalServerError()
                    .body("Sorry, I couldn't process that. Please try again.");
        }
    }

    @PostMapping("/prepare-interview")
    public ResponseEntity<?> prepareInterview(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jd") String jd) {
        try {
            Map<String, Object> result = aiService.prepareInterview(file, jd);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
