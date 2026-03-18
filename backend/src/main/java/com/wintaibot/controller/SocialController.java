package com.wintaibot.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Social platform connect/status/disconnect endpoints for Video Publisher.
 * OAuth integration is stubbed; implement real OAuth flow for production.
 */
@RestController
@RequestMapping("/api/social")
public class SocialController {

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Value("${linkedin.client-id:}")
    private String linkedinClientId;

    @Value("${linkedin.scope:openid profile email w_member_social}")
    private String linkedinScope;

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

        String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
        String callbackUrl = baseUrl + "/api/social/callback/" + pid;

        // LinkedIn: build real OAuth URL with client_id
        if ("linkedin".equals(pid)) {
            if (linkedinClientId == null || linkedinClientId.isBlank()) {
                return ResponseEntity.status(500).body(Map.of(
                    "error", "LinkedIn OAuth not configured. Set linkedin.client-id in application.properties or LINKEDIN_CLIENT_ID env var."
                ));
            }
            try {
                String state = UUID.randomUUID().toString();
                String authUrl = "https://www.linkedin.com/oauth/v2/authorization"
                    + "?response_type=code"
                    + "&client_id=" + URLEncoder.encode(linkedinClientId, StandardCharsets.UTF_8)
                    + "&redirect_uri=" + URLEncoder.encode(callbackUrl, StandardCharsets.UTF_8)
                    + "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8)
                    + "&scope=" + URLEncoder.encode(linkedinScope, StandardCharsets.UTF_8);
                return ResponseEntity.ok(Map.of("url", authUrl));
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to build LinkedIn OAuth URL: " + e.getMessage()));
            }
        }

        // Other platforms: return callback URL (stub; configure real OAuth per platform)
        return ResponseEntity.ok(Map.of("url", callbackUrl));
    }

    /**
     * OAuth callback: TikTok, Instagram, etc. redirect here after user approves.
     * URL pattern: /api/social/callback/{platform} (e.g. /api/social/callback/tiktok, /api/social/callback/instagram)
     */
    @GetMapping("/callback/{platform}")
    public ResponseEntity<?> callback(
            @PathVariable String platform,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error) {
        String pid = normalizePlatform(platform);
        if (pid == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown platform: " + platform));
        }
        if (error != null) {
            // OAuth error (user denied, etc.) - redirect to app with error
            String redirectUrl = appBaseUrl + "?social_connect=error&platform=" + pid + "&error=" + error;
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
        }
        // TODO: Exchange code for token, store per user (state can carry userId/session), then redirect
        String redirectUrl = appBaseUrl + "?social_connect=success&platform=" + pid;
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/oauth-placeholder")
    public ResponseEntity<?> oauthPlaceholder(
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String status) {
        // Redirect to frontend with ?social_connect=success&platform=... so the app can refresh connections
        String pid = platform != null ? normalizePlatform(platform) : null;
        if (pid != null && "connected".equalsIgnoreCase(status)) {
            String redirectUrl = appBaseUrl + "?social_connect=success&platform=" + pid;
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(redirectUrl));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
        // Fallback: simple HTML for popup (e.g. when opened without platform param)
        String platformName = platform != null ? platform : "platform";
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Connect</title>" +
                "<style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc}" +
                ".box{background:#fff;padding:32px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;max-width:360px}" +
                "h2{color:#1e293b;margin:0 0 12px}.p{color:#64748b;font-size:14px;line-height:1.6}" +
                ".ok{color:#16a34a;font-weight:700;margin-top:16px}</style></head><body>" +
                "<div class=\"box\"><h2>✓ " + (status != null ? "Connected to " + platformName : "OAuth") + "</h2>" +
                "<p class=\"p\">You can close this window and return to Wintaibot.</p>" +
                "<p class=\"ok\">" + (status != null ? "Connection saved." : "Setup complete.") + "</p></div>" +
                "<script>setTimeout(function(){window.close()},2000)</script></body></html>";
        return ResponseEntity.ok(html);
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
