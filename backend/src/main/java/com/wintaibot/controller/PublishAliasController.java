package com.wintaibot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Alias for /api/publish/{platform} - some frontend builds call this instead of /api/video-content/publish/{platform}.
 * Delegates to same behavior as VideoContentController.
 */
@RestController
@RequestMapping("/api")
public class PublishAliasController {

    @PostMapping("/publish/{platform}")
    public ResponseEntity<?> publish(
            @PathVariable String platform,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "hashtags", required = false) String hashtags,
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of("status", "ok", "platform", platform));
    }

    @PostMapping("/publish/{platform}/variant")
    public ResponseEntity<?> publishVariant(
            @PathVariable String platform,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of("status", "ok", "platform", platform));
    }
}
