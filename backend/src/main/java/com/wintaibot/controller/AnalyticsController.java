package com.wintaibot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
}
