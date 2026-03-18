package com.wintaibot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * Stub endpoints for Video Publisher flow.
 * Returns mock data so the frontend can complete upload → review → publish → analytics
 * without 500 errors. Replace with real video processing and platform APIs for production.
 */
@RestController
@RequestMapping("/api/video-content")
public class VideoContentController {

    private static final java.util.concurrent.atomic.AtomicLong ID_GEN = new java.util.concurrent.atomic.AtomicLong(1);

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        String id = "mock-" + ID_GEN.getAndIncrement();
        Map<String, Object> body = new HashMap<>();
        body.put("id", id);
        body.put("videoId", id);
        body.put("variants", Collections.emptyList()); // frontend will use mock variants
        return ResponseEntity.ok(body);
    }

    @GetMapping("/videos/{id}")
    public ResponseEntity<Map<String, Object>> getVideo(
            @PathVariable String id,
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Map<String, Object> body = new HashMap<>();
        body.put("id", id);
        body.put("variants", Collections.emptyList());
        return ResponseEntity.ok(body);
    }

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
        try {
            // Stub: accept and return success. Real impl would post to YouTube/Instagram/etc.
            return ResponseEntity.ok(Map.of("status", "ok", "platform", platform));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Publish failed"));
        }
    }

    @PostMapping("/publish/{platform}/variant")
    public ResponseEntity<?> publishVariant(
            @PathVariable String platform,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        try {
            // Stub: accept variantId, caption, hashtags and return success
            return ResponseEntity.ok(Map.of("status", "ok", "platform", platform));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Publish failed"));
        }
    }

    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> trends(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Map<String, Object> body = new HashMap<>();
        body.put("trends", List.of(
                "#AITools trending on TikTok and Reels",
                "Short-form vertical video engagement up 40% this week",
                "Best posting time: Tuesday 7 PM (your audience)",
                "POV and \"Get ready with me\" formats still peaking"
        ));
        body.put("news", List.of(
                "Instagram Reels: algorithm now prioritizes original audio.",
                "YouTube Shorts: 60s clips rolling out in more regions.",
                "TikTok: new \"Series\" feature for multi-part content."
        ));
        return ResponseEntity.ok(body);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> analytics(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of("views", 12400, "likes", 1800, "comments", 342));
    }

    @PostMapping("/variants/{id}/schedule")
    public ResponseEntity<Map<String, String>> scheduleVariant(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of("status", "scheduled"));
    }

    @GetMapping("/analytics/insights")
    public ResponseEntity<Map<String, Object>> analyticsInsights(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Map<String, Object> body = new HashMap<>();
        body.put("insights", List.of(
                "Your short videos (15–20s) perform 4x better than long ones",
                "Best posting time: Tuesday & Thursday 7–9 PM",
                "Recommendation: Create more vertical clips for TikTok & Reels",
                "Trending topic detected: #AITools — create content now"
        ));
        body.put("nextIdeas", List.of(
                "5 AI tools that replace your whole team — trending format",
                "Behind-the-scenes: How you built Wintaibot",
                "React vs Vue debate — high engagement topic this week"
        ));
        body.put("metrics", List.of(
                Map.of("label", "Views", "value", "12.4K", "icon", "👁️", "color", "#2563eb"),
                Map.of("label", "Likes", "value", "1.8K", "icon", "❤️", "color", "#ef4444"),
                Map.of("label", "Comments", "value", "342", "icon", "💬", "color", "#f59e0b"),
                Map.of("label", "Shares", "value", "891", "icon", "🔁", "color", "#22c55e"),
                Map.of("label", "Engagement", "value", "8.4%", "icon", "📊", "color", "#7c3aed"),
                Map.of("label", "New Followers", "value", "+214", "icon", "👥", "color", "#0891b2")
        ));
        return ResponseEntity.ok(body);
    }
}
