package com.wintaibot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Analytics API. Overview data may be implemented elsewhere; this endpoint supports
 * the dashboard "Remove" action until publish-activity rows are persisted server-side.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    /**
     * Acknowledges removal from the user's view. The React app persists hidden IDs in localStorage;
     * wire this to a DB when publish activity is stored server-side.
     */
    @DeleteMapping("/activity/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable String id, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Stub: returns all posts (published + scheduled) for the calendar view.
     * Replace with a real DB query once post persistence is implemented.
     */
    @GetMapping("/calendar")
    public ResponseEntity<List<Map<String, Object>>> calendar(
            @RequestParam(defaultValue = "") String year,
            @RequestParam(defaultValue = "") String month,
            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        String[][] data = {
            {"youtube",   "2026-03-05T14:00:00Z", "Sell Your House Without Lifting a Finger", "video",  "SUCCESS"},
            {"instagram", "2026-03-10T09:00:00Z", "Behind the Scenes",                        "image",  "SUCCESS"},
            {"tiktok",    "2026-03-15T18:00:00Z", "Quick Tutorial",                            "video",  "SUCCESS"},
            {"linkedin",  "2026-03-18T11:00:00Z", "Industry Insights",                         "text",   "SUCCESS"},
            {"facebook",  "2026-03-22T08:00:00Z", "Home Selling Tips",                         "image",  "SUCCESS"},
            {"youtube",   "2026-03-29T12:41:00Z", "Sell Your House Without Lifting a Finger", "video",  "SCHEDULED"},
            {"instagram", "2026-03-29T12:41:00Z", "Sell Your House Without Lifting a Finger", "video",  "SCHEDULED"},
            {"tiktok",    "2026-03-29T12:41:00Z", "Sell Your House Without Lifting a Finger", "video",  "SCHEDULED"},
            {"linkedin",  "2026-03-29T12:41:00Z", "Sell Your House Without Lifting a Finger", "video",  "SCHEDULED"},
            {"youtube",   "2026-04-02T14:00:00Z", "New Product Launch",                        "video",  "SCHEDULED"},
            {"instagram", "2026-04-05T09:00:00Z", "Spring Collection",                         "image",  "SCHEDULED"},
            {"tiktok",    "2026-04-08T18:00:00Z", "Dance Challenge",                           "video",  "SCHEDULED"},
            {"linkedin",  "2026-04-10T11:00:00Z", "Leadership Tips",                           "text",   "SCHEDULED"},
        };
        List<Map<String, Object>> posts = new ArrayList<>();
        for (String[] row : data) {
            Map<String, Object> m = new HashMap<>();
            m.put("platform",  row[0]);
            m.put("date",      row[1]);
            m.put("caption",   row[2]);
            m.put("mediaType", row[3]);
            m.put("status",    row[4]);
            posts.add(m);
        }
        return ResponseEntity.ok(posts);
    }
}
