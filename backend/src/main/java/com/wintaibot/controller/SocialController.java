package com.wintaibot.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Social platform connect/status/disconnect endpoints for Video Publisher.
 * Facebook/Instagram: real OAuth flow. Other platforms: stubbed.
 */
@RestController
@RequestMapping("/api/social")
public class SocialController {

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Value("${app.api-base-url:}")
    private String appApiBaseUrl;

    @Value("${linkedin.client-id:}")
    private String linkedinClientId;

    @Value("${linkedin.scope:openid profile email w_member_social}")
    private String linkedinScope;

    @Value("${facebook.app-id:}")
    private String facebookAppId;

    @Value("${facebook.app-secret:}")
    private String facebookAppSecret;

    @Value("${facebook.verify-token:}")
    private String facebookVerifyToken;

    @Value("${facebook.access-token:}")
    private String facebookAccessToken;

    private final RestTemplate restTemplate = new RestTemplate();

    // In-memory: userId -> Set of connected platform IDs
    private static final Map<Long, Set<String>> CONNECTED = new ConcurrentHashMap<>();
    // In-memory: userId -> platform -> access token (for publishing)
    private static final Map<Long, Map<String, String>> TOKENS = new ConcurrentHashMap<>();
    // state (from OAuth) -> userId, expires after 10 min
    private static final Map<String, Long> STATE_TO_USER = new ConcurrentHashMap<>();

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
        String baseUrl = buildAbsoluteApiBaseUrl(request);
        String callbackUrl = baseUrl + "/api/social/callback/" + pid;

        // Facebook & Instagram: real OAuth URL
        if ("facebook".equals(pid) || "instagram".equals(pid)) {
            if (facebookAppId == null || facebookAppId.isBlank()) {
                return ResponseEntity.status(500).body(Map.of(
                    "error", "Facebook OAuth not configured. Set facebook.app-id and facebook.app-secret."
                ));
            }
            try {
                String state = "fb_" + UUID.randomUUID().toString();
                STATE_TO_USER.put(state, userId);
                String scope = "pages_show_list,pages_manage_posts,publish_video,instagram_basic,instagram_content_publish";
                String authUrl = "https://www.facebook.com/v21.0/dialog/oauth"
                    + "?client_id=" + URLEncoder.encode(facebookAppId, StandardCharsets.UTF_8)
                    + "&redirect_uri=" + URLEncoder.encode(callbackUrl, StandardCharsets.UTF_8)
                    + "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8)
                    + "&scope=" + URLEncoder.encode(scope, StandardCharsets.UTF_8)
                    + "&response_type=code";
                return ResponseEntity.ok(Map.of("url", authUrl));
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to build Facebook OAuth URL: " + e.getMessage()));
            }
        }

        // LinkedIn: build real OAuth URL
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

        // Other platforms: stub
        CONNECTED.computeIfAbsent(userId, k -> new HashSet<>()).add(pid);
        return ResponseEntity.ok(Map.of("url", callbackUrl));
    }

    /**
     * OAuth callback: Facebook, LinkedIn, etc. redirect here after user approves.
     */
    @GetMapping("/callback/{platform}")
    public ResponseEntity<?> callback(
            @PathVariable String platform,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            @RequestParam(name = "hub.mode", required = false) String hubMode,
            @RequestParam(name = "hub.verify_token", required = false) String hubVerifyToken,
            @RequestParam(name = "hub.challenge", required = false) String hubChallenge,
            HttpServletRequest request) {
        String pid = normalizePlatform(platform);
        if (pid == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown platform: " + platform));
        }

        // Meta webhook verification (GET with hub.mode=subscribe)
        if ("subscribe".equals(hubMode) && hubChallenge != null) {
            if (facebookVerifyToken != null && !facebookVerifyToken.isBlank()
                    && facebookVerifyToken.equals(hubVerifyToken)) {
                return ResponseEntity.ok(hubChallenge);
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (error != null) {
            String redirectUrl = appBaseUrl + "?social_connect=error&platform=" + pid + "&error=" + error;
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
        }

        // Facebook & Instagram: exchange code for token
        if (("facebook".equals(pid) || "instagram".equals(pid)) && code != null && !code.isBlank()) {
            if (facebookAppId == null || facebookAppSecret == null || facebookAppId.isBlank() || facebookAppSecret.isBlank()) {
                String redirectUrl = appBaseUrl + "?social_connect=error&platform=" + pid + "&error=Facebook+not+configured";
                return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
            }
            Long userId = null;
            if (state != null && state.startsWith("fb_")) {
                userId = STATE_TO_USER.remove(state);
            }
            if (userId == null) {
                String redirectUrl = appBaseUrl + "?social_connect=error&platform=" + pid + "&error=Invalid+state";
                return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
            }
            String callbackUrl = buildAbsoluteApiBaseUrl(request) + "/api/social/callback/" + pid;
            try {
                String tokenUrl = "https://graph.facebook.com/v21.0/oauth/access_token"
                    + "?client_id=" + URLEncoder.encode(facebookAppId, StandardCharsets.UTF_8)
                    + "&redirect_uri=" + URLEncoder.encode(callbackUrl, StandardCharsets.UTF_8)
                    + "&client_secret=" + URLEncoder.encode(facebookAppSecret, StandardCharsets.UTF_8)
                    + "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8);
                Map<?, ?> tokenRes = restTemplate.getForObject(tokenUrl, Map.class);
                if (tokenRes == null || !tokenRes.containsKey("access_token")) {
                    String err = tokenRes != null && tokenRes.containsKey("error") ? String.valueOf(tokenRes.get("error")) : "No token";
                    String redirectUrl = appBaseUrl + "?social_connect=error&platform=" + pid + "&error=" + URLEncoder.encode(String.valueOf(err), StandardCharsets.UTF_8);
                    return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
                }
                String accessToken = (String) tokenRes.get("access_token");
                // Exchange for long-lived token
                String longLivedUrl = "https://graph.facebook.com/v21.0/oauth/access_token"
                    + "?grant_type=fb_exchange_token"
                    + "&client_id=" + URLEncoder.encode(facebookAppId, StandardCharsets.UTF_8)
                    + "&client_secret=" + URLEncoder.encode(facebookAppSecret, StandardCharsets.UTF_8)
                    + "&fb_exchange_token=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
                Map<?, ?> longLivedRes = restTemplate.getForObject(longLivedUrl, Map.class);
                if (longLivedRes != null && longLivedRes.containsKey("access_token")) {
                    accessToken = (String) longLivedRes.get("access_token");
                }
                // Get Page token for publishing (same token works for Facebook Page + Instagram)
                String accountsUrl = "https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
                Map<?, ?> accountsRes = restTemplate.getForObject(accountsUrl, Map.class);
                String pageToken = accessToken;
                if (accountsRes != null && accountsRes.containsKey("data")) {
                    List<?> data = (List<?>) accountsRes.get("data");
                    if (data != null && !data.isEmpty()) {
                        Map<?, ?> firstPage = (Map<?, ?>) data.get(0);
                        if (firstPage != null && firstPage.containsKey("access_token")) {
                            pageToken = (String) firstPage.get("access_token");
                        }
                    }
                }
                TOKENS.computeIfAbsent(userId, k -> new ConcurrentHashMap<>()).put("facebook", pageToken);
                TOKENS.get(userId).put("instagram", pageToken);
                CONNECTED.computeIfAbsent(userId, k -> new HashSet<>()).add("facebook");
                CONNECTED.get(userId).add("instagram");
            } catch (Exception e) {
                String errMsg = e.getMessage() != null ? e.getMessage() : "Token exchange failed";
                String redirectUrl = appBaseUrl + "?social_connect=error&platform=" + pid + "&error=" + URLEncoder.encode(errMsg, StandardCharsets.UTF_8);
                return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
            }
        }

        String redirectUrl = appBaseUrl + "?social_connect=success&platform=" + pid;
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
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

    /**
     * Returns the access token for publishing to the given platform.
     * For Facebook/Instagram: checks user's stored token first, then FACEBOOK_ACCESS_TOKEN env fallback.
     */
    public String getPublishToken(Long userId, String platform) {
        Map<String, String> userTokens = TOKENS.get(userId);
        String token = userTokens != null ? userTokens.get(platform) : null;
        if ((token == null || token.isBlank()) && ("facebook".equals(platform) || "instagram".equals(platform))) {
            token = (facebookAccessToken != null && !facebookAccessToken.isBlank()) ? facebookAccessToken : null;
        }
        return token;
    }

    /** Ensures OAuth callback URL is absolute (RFC 3986). Fallback to production when empty. */
    private String buildAbsoluteApiBaseUrl(HttpServletRequest request) {
        String base = (appApiBaseUrl != null && !appApiBaseUrl.isBlank())
                ? appApiBaseUrl.replaceAll("/$", "")
                : request.getRequestURL().toString().replace(request.getRequestURI(), "");
        if (base == null || base.isBlank()) {
            return "https://api.wintaibot.com";
        }
        if (!base.startsWith("http://") && !base.startsWith("https://")) {
            base = "https://" + base;
        }
        return base;
    }

    private static String normalizePlatform(String platform) {
        if (platform == null) return null;
        String p = platform.toLowerCase().trim();
        Set<String> valid = Set.of("youtube", "instagram", "tiktok", "linkedin", "facebook", "x", "threads", "pinterest");
        return valid.contains(p) ? p : null;
    }
}
