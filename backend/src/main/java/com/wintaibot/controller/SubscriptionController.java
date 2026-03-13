package com.wintaibot.controller;

import com.wintaibot.dto.CheckoutRequest;
import com.wintaibot.dto.CheckoutResponse;
import com.wintaibot.service.StripeSubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private final StripeSubscriptionService stripeService;

    public SubscriptionController(StripeSubscriptionService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@Valid @RequestBody CheckoutRequest req,
                                                     Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        String url = stripeService.createCheckoutSession(userId);
        return ResponseEntity.ok(new CheckoutResponse(url));
    }

    @GetMapping("/verify-session")
    public ResponseEntity<Map<String, Object>> verifySession(@RequestParam String session_id,
                                                            Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        boolean upgraded = stripeService.verifyCheckoutSession(session_id, userId);
        return ResponseEntity.ok(Map.of("upgraded", upgraded));
    }

    @PostMapping("/portal")
    public ResponseEntity<Map<String, String>> billingPortal(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        String url = stripeService.createBillingPortalSession(userId);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        Map<String, Object> status = stripeService.getSubscriptionStatus(userId);
        return ResponseEntity.ok(status);
    }

    /** Cancel membership at period end — user keeps access until then. */
    @PostMapping("/cancel")
    public ResponseEntity<Map<String, String>> cancel(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        try {
            stripeService.cancelSubscriptionAtPeriodEnd(userId);
            return ResponseEntity.ok(Map.of("message", "Membership will cancel at the end of the current billing period. You can still use member features until then."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Reactivate a membership that was set to cancel at period end (undo cancellation). */
    @PostMapping("/reactivate")
    public ResponseEntity<Map<String, String>> reactivate(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        try {
            stripeService.reactivateSubscription(userId);
            return ResponseEntity.ok(Map.of("message", "Membership reactivated. Your subscription will continue."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<Map<String, Object>>> invoices(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Long)) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) auth.getPrincipal();
        List<Map<String, Object>> invoices = stripeService.getInvoices(userId);
        return ResponseEntity.ok(invoices);
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestBody String payload,
                                    @RequestHeader("Stripe-Signature") String sigHeader) {
        stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
