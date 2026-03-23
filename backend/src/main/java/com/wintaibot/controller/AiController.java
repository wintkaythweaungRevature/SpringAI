package com.wintaibot.controller;

import com.wintaibot.service.AiService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

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
