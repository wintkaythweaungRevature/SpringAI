package com.wintaibot.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Social platform connect/status/disconnect endpoints for Video Publisher.
 * OAuth integration is stubbed; implement real OAuth flow for production.
 */
@RestController
@RequestMapping("/api/social")
public class SocialController {

    // In-memory stub: userId -> Set of connected platform IDs. Replace with DB in production.
    private static final Map<Long, Set<String>> CONNECTED = new HashMap<>();

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        Set<String> platforms = CONNECTED.getOrDefault(userId, Collections.emptySet());
        return ResponseEntity.ok(Map.of("connected", new ArrayList<>(platforms)));
    }

    @GetMapping("/connect/{platform}")
    public ResponseEntity<Map<String, String>> connect(
            @PathVariable String platform,
            Authentication auth,
            HttpServletRequest request) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        String pid = normalizePlatform(platform);
        if (pid == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown platform: " + platform));
        }
        Long userId = (Long) auth.getPrincipal();
        CONNECTED.computeIfAbsent(userId, k -> new HashSet<>()).add(pid);

        // Stub: return placeholder URL. In production, generate real OAuth URL.
        String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
        String placeholderUrl = baseUrl + "/api/social/oauth-placeholder?platform=" + pid + "&status=connected";
        return ResponseEntity.ok(Map.of("url", placeholderUrl));
    }

    @GetMapping("/oauth-placeholder")
    public String oauthPlaceholder(
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String status) {
        // Simple HTML page for popup - no auth required so OAuth callback can land here
        String platformName = platform != null ? platform : "platform";
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Connect</title>" +
                "<style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc}" +
                ".box{background:#fff;padding:32px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;max-width:360px}" +
                "h2{color:#1e293b;margin:0 0 12px}.p{color:#64748b;font-size:14px;line-height:1.6}" +
                ".ok{color:#16a34a;font-weight:700;margin-top:16px}</style></head><body>" +
                "<div class=\"box\"><h2>✓ " + (status != null ? "Connected to " + platformName : "OAuth") + "</h2>" +
                "<p class=\"p\">You can close this window and return to Wintaibot.</p>" +
                "<p class=\"ok\">" + (status != null ? "Connection saved." : "Setup complete.") + "</p></div>" +
                "<script>setTimeout(function(){window.close()},2000)</script></body></html>";
    }

    @DeleteMapping("/disconnect/{platform}")
    public ResponseEntity<?> disconnect(
            @PathVariable String platform,
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        String pid = normalizePlatform(platform);
        Long userId = (Long) auth.getPrincipal();
        Set<String> set = CONNECTED.get(userId);
        if (set != null) {
            set.remove(pid);
        }
        return ResponseEntity.ok().build();
    }

    private static String normalizePlatform(String platform) {
        if (platform == null) return null;
        String p = platform.toLowerCase().trim();
        Set<String> valid = Set.of("youtube", "instagram", "tiktok", "linkedin", "facebook", "x", "threads", "pinterest");
        return valid.contains(p) ? p : null;
    }
}
