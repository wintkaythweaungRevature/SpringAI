package com.wintaibot.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Price;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionItem;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.SubscriptionRetrieveParams;
import com.stripe.param.SubscriptionUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.wintaibot.dto.CheckoutRequest;
import com.wintaibot.dto.CheckoutResponse;
import com.wintaibot.entity.User;
import com.wintaibot.exception.BadRequestException;
import com.wintaibot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeSubscriptionService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.price-id}")
    private String priceId;

    @Value("${stripe.price.starter.monthly:}")
    private String priceStarterMonthly;

    @Value("${stripe.price.starter.yearly:}")
    private String priceStarterYearly;

    @Value("${stripe.price.pro.monthly:}")
    private String priceProMonthly;

    @Value("${stripe.price.pro.yearly:}")
    private String priceProYearly;

    @Value("${stripe.price.growth.monthly:}")
    private String priceGrowthMonthly;

    @Value("${stripe.price.growth.yearly:}")
    private String priceGrowthYearly;

    /**
     * Optional: comma-separated {@code price_id:PLAN} entries (PLAN = STARTER|PRO|GROWTH).
     * Example: {@code price_abc:STARTER,price_def:PRO}
     */
    @Value("${stripe.subscription-plan-by-price:}")
    private String subscriptionPlanByPrice;

    @Value("${app.success-url:http://localhost:3000}")
    private String successUrl;

    @Value("${app.cancel-url:http://localhost:3000}")
    private String cancelUrl;

    private final UserRepository userRepository;

    public StripeSubscriptionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * New subscription → Stripe Checkout. Existing active subscription → update price in place (proration).
     */
    public CheckoutResponse checkout(Long userId, CheckoutRequest req) {
        Stripe.apiKey = stripeSecretKey;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String planNorm = normalizePlanKey(req.getPlan());
        boolean yearly = isYearlyInterval(req.getBillingInterval());
        String targetPriceId = resolveStripePriceId(planNorm, yearly);

        String subId = user.getStripeSubscriptionId();
        if (subId != null && !subId.isEmpty()) {
            try {
                Subscription sub = Subscription.retrieve(subId);
                String st = sub.getStatus();
                if ("active".equals(st) || "trialing".equals(st) || "past_due".equals(st)) {
                    return updateSubscriptionToPrice(user, targetPriceId, planNorm);
                }
            } catch (BadRequestException e) {
                throw e;
            } catch (Exception e) {
                // Stale subscription id or API error — fall through to new Checkout
            }
        }

        String checkoutUrl = createNewSubscriptionCheckout(user, targetPriceId, planNorm);
        return new CheckoutResponse(checkoutUrl);
    }

    private String normalizePlanKey(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("Plan is required");
        }
        String p = raw.trim().toUpperCase();
        if ("MEMBER".equals(p)) {
            return "STARTER";
        }
        if ("STARTER".equals(p) || "PRO".equals(p) || "GROWTH".equals(p)) {
            return p;
        }
        throw new BadRequestException("Unknown plan: " + raw + ". Use STARTER, PRO, or GROWTH.");
    }

    private boolean isYearlyInterval(String billingInterval) {
        if (billingInterval == null || billingInterval.isBlank()) {
            return false;
        }
        String b = billingInterval.trim().toUpperCase();
        if ("YEARLY".equals(b) || "ANNUAL".equals(b) || "YEAR".equals(b)) {
            return true;
        }
        if ("MONTHLY".equals(b) || "MONTH".equals(b)) {
            return false;
        }
        throw new BadRequestException("billingInterval must be MONTHLY or YEARLY");
    }

    private String resolveStripePriceId(String planNorm, boolean yearly) {
        String id = switch (planNorm) {
            case "STARTER" -> yearly ? priceStarterYearly : priceStarterMonthly;
            case "PRO" -> yearly ? priceProYearly : priceProMonthly;
            case "GROWTH" -> yearly ? priceGrowthYearly : priceGrowthMonthly;
            default -> "";
        };
        if (id != null && !id.isBlank()) {
            return id.trim();
        }
        if ("STARTER".equals(planNorm) && !yearly && priceId != null && !priceId.isBlank()) {
            return priceId.trim();
        }
        throw new BadRequestException(
                "Stripe price not configured for " + planNorm + " (" + (yearly ? "yearly" : "monthly")
                        + "). Set stripe.price." + planNorm.toLowerCase() + "."
                        + (yearly ? "yearly" : "monthly") + " or legacy stripe.price-id for Starter monthly.");
    }

    private com.wintaibot.dto.CheckoutResponse updateSubscriptionToPrice(User user, String targetPriceId, String planNorm) {
        try {
            Subscription sub = retrieveSubscriptionExpanded(user.getStripeSubscriptionId());
            SubscriptionItem item = firstSubscriptionItem(sub);
            if (item == null) {
                throw new BadRequestException("Subscription has no line items.");
            }
            String currentPid = item.getPrice() != null ? item.getPrice().getId() : null;
            if (targetPriceId.equals(currentPid)) {
                return CheckoutResponse.updated(
                        "You're already on this plan and billing cycle.");
            }
            java.util.Map<String, String> meta = new java.util.HashMap<>();
            if (sub.getMetadata() != null) {
                meta.putAll(sub.getMetadata());
            }
            meta.put("plan", planNorm);

            SubscriptionUpdateParams.Builder b = SubscriptionUpdateParams.builder()
                    .addItem(
                            SubscriptionUpdateParams.Item.builder()
                                    .setId(item.getId())
                                    .setPrice(targetPriceId)
                                    .build()
                    )
                    .setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.CREATE_PRORATIONS);
            for (java.util.Map.Entry<String, String> e : meta.entrySet()) {
                b.putMetadata(e.getKey(), e.getValue());
            }
            Subscription.retrieve(sub.getId()).update(b.build());
            return CheckoutResponse.updated(
                    "Plan updated. Prorated charges or credits may appear on your next invoice.");
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not update subscription: " + e.getMessage());
        }
    }

    private String createNewSubscriptionCheckout(User user, String targetPriceId, String planNorm) {
        SessionCreateParams.Builder sb = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(targetPriceId)
                                .setQuantity(1L)
                                .build()
                )
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .putMetadata("userId", String.valueOf(user.getId()))
                .setSubscriptionData(
                        SessionCreateParams.SubscriptionData.builder()
                                .putMetadata("plan", planNorm)
                                .build()
                );
        String cust = user.getStripeCustomerId();
        if (cust != null && !cust.isEmpty()) {
            sb.setCustomer(cust);
        } else {
            sb.setCustomerEmail(user.getEmail());
        }
        try {
            Session session = Session.create(sb.build());
            return session.getUrl();
        } catch (Exception e) {
            throw new BadRequestException("Failed to create checkout session: " + e.getMessage());
        }
    }

    public String createBillingPortalSession(Long userId) {
        Stripe.apiKey = stripeSecretKey;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String customerId = user.getStripeCustomerId();
        if (customerId == null || customerId.isEmpty()) {
            throw new RuntimeException("No billing account. Subscribe first to manage billing and view invoices.");
        }
        try {
            com.stripe.param.billingportal.SessionCreateParams params =
                    com.stripe.param.billingportal.SessionCreateParams.builder()
                            .setCustomer(customerId)
                            .setReturnUrl(successUrl)
                            .build();
            com.stripe.model.billingportal.Session session =
                    com.stripe.model.billingportal.Session.create(params);
            return session.getUrl();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create billing portal session: " + e.getMessage());
        }
    }

    public void handleSubscriptionCreated(String customerId, String subscriptionId, String userIdStr) {
        Long userId = Long.parseLong(userIdStr);
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setStripeCustomerId(customerId);
            user.setStripeSubscriptionId(subscriptionId);
            user.setMembershipType(User.MembershipType.MEMBER);
            userRepository.save(user);
        }
    }

    public void cancelSubscription(String subscriptionId) {
        if (subscriptionId == null || subscriptionId.isEmpty()) return;
        Stripe.apiKey = stripeSecretKey;
        try {
            Subscription sub = Subscription.retrieve(subscriptionId);
            sub.cancel();
        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel subscription: " + e.getMessage());
        }
    }

    public void handleSubscriptionDeleted(String subscriptionId) {
        userRepository.findAll().stream()
                .filter(u -> subscriptionId.equals(u.getStripeSubscriptionId()))
                .findFirst()
                .ifPresent(user -> {
                    user.setStripeSubscriptionId(null);
                    user.setMembershipType(User.MembershipType.FREE);
                    userRepository.save(user);
                });
    }

    /**
     * Verify checkout session and upgrade user to MEMBER if payment completed.
     * Fallback when webhook is not configured or delayed.
     */
    public boolean verifyCheckoutSession(String sessionId, Long userId) {
        if (sessionId == null || sessionId.isEmpty() || userId == null) return false;
        Stripe.apiKey = stripeSecretKey;
        try {
            Session session = Session.retrieve(sessionId);
            if (session == null) return false;
            if (!"complete".equalsIgnoreCase(session.getStatus())) return false;
            String metaUserId = session.getMetadata() != null ? session.getMetadata().get("userId") : null;
            if (metaUserId == null || !metaUserId.equals(String.valueOf(userId))) return false;
            String subId = session.getSubscription();
            if (subId == null || subId.isEmpty()) return false;
            String customerId = session.getCustomer();
            handleSubscriptionCreated(customerId, subId, metaUserId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /** Returns the last 10 invoices for the user from Stripe. */
    public java.util.List<java.util.Map<String, Object>> getInvoices(Long userId) {
        Stripe.apiKey = stripeSecretKey;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String customerId = user.getStripeCustomerId();
        if (customerId == null || customerId.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        try {
            var params = com.stripe.param.InvoiceListParams.builder()
                    .setCustomer(customerId)
                    .setLimit(10L)
                    .build();
            var invoices = com.stripe.model.Invoice.list(params);
            java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
            for (var inv : invoices.getData()) {
                java.util.Map<String, Object> item = new java.util.HashMap<>();
                item.put("id", inv.getId());
                item.put("number", inv.getNumber());
                item.put("status", inv.getStatus());
                item.put("amountPaid", inv.getAmountPaid());
                item.put("currency", inv.getCurrency());
                item.put("created", inv.getCreated());
                item.put("invoicePdf", inv.getInvoicePdf());
                item.put("hostedInvoiceUrl", inv.getHostedInvoiceUrl());
                result.add(item);
            }
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve invoices: " + e.getMessage());
        }
    }

    /** Returns subscription status for the current user. */
    public java.util.Map<String, Object> getSubscriptionStatus(Long userId) {
        Stripe.apiKey = stripeSecretKey;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        java.util.Map<String, Object> status = new java.util.HashMap<>();
        status.put("plan", user.getMembershipType().name());
        status.put("active", user.getMembershipType() == User.MembershipType.MEMBER);
        status.put("stripeCustomerId", user.getStripeCustomerId());

        String subId = user.getStripeSubscriptionId();
        if (subId != null && !subId.isEmpty()) {
            try {
                Subscription sub = retrieveSubscriptionExpanded(subId);
                status.put("subscriptionStatus", sub.getStatus());
                status.put("cancelAtPeriodEnd", sub.getCancelAtPeriodEnd());
                if (sub.getCurrentPeriodEnd() != null) {
                    status.put("subscriptionPeriodEnd",
                            java.time.Instant.ofEpochSecond(sub.getCurrentPeriodEnd())
                                    .toString().substring(0, 10));
                }
                String billingInterval = billingIntervalFromSubscription(sub);
                if (billingInterval != null) {
                    status.put("billingInterval", billingInterval);
                }
                String tier = resolvePlanTier(sub, user);
                status.put("planTier", tier);
            } catch (Exception e) {
                status.put("subscriptionStatus", "unknown");
            }
        }
        return status;
    }

    /**
     * Plan tier + billing interval for the SPA (Pro gate, account annual upsell).
     */
    public java.util.Map<String, Object> getSubscriptionCurrent(Long userId) {
        Stripe.apiKey = stripeSecretKey;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        java.util.Map<String, Object> out = new java.util.HashMap<>();
        out.put("plan", tierFromUserOnly(user));
        out.put("billingInterval", null);
        out.put("cancelAtPeriodEnd", false);

        String subId = user.getStripeSubscriptionId();
        if (subId == null || subId.isEmpty()) {
            return out;
        }
        try {
            Subscription sub = retrieveSubscriptionExpanded(subId);
            out.put("plan", resolvePlanTier(sub, user));
            out.put("billingInterval", billingIntervalFromSubscription(sub));
            out.put("cancelAtPeriodEnd", Boolean.TRUE.equals(sub.getCancelAtPeriodEnd()));
        } catch (Exception e) {
            out.put("plan", tierFromUserOnly(user));
        }
        return out;
    }

    private Subscription retrieveSubscriptionExpanded(String subId) throws Exception {
        SubscriptionRetrieveParams params = SubscriptionRetrieveParams.builder()
                .addExpand("items.data.price")
                .build();
        return Subscription.retrieve(subId, params, null);
    }

    private String billingIntervalFromSubscription(Subscription sub) {
        SubscriptionItem item = firstSubscriptionItem(sub);
        if (item == null) return null;
        Price price = item.getPrice();
        if (price == null || price.getRecurring() == null) return null;
        String interval = price.getRecurring().getInterval();
        if ("month".equals(interval)) return "MONTHLY";
        if ("year".equals(interval)) return "YEARLY";
        return null;
    }

    private SubscriptionItem firstSubscriptionItem(Subscription sub) {
        if (sub == null || sub.getItems() == null || sub.getItems().getData() == null
                || sub.getItems().getData().isEmpty()) {
            return null;
        }
        return sub.getItems().getData().get(0);
    }

    private String tierFromUserOnly(User user) {
        if (user.getMembershipType() == User.MembershipType.FREE) {
            return "FREE";
        }
        if (user.getMembershipType() == User.MembershipType.MEMBER) {
            return "STARTER";
        }
        return user.getMembershipType().name();
    }

    private String resolvePlanTier(Subscription sub, User user) {
        if (sub != null && sub.getMetadata() != null) {
            String metaPlan = sub.getMetadata().get("plan");
            if (metaPlan != null && !metaPlan.isBlank()) {
                return metaPlan.trim().toUpperCase();
            }
        }
        SubscriptionItem item = firstSubscriptionItem(sub);
        if (item != null && item.getPrice() != null && item.getPrice().getId() != null) {
            String priceIdFound = item.getPrice().getId();
            if (priceId != null && !priceId.isEmpty() && priceId.equals(priceIdFound)) {
                return "STARTER";
            }
            String fromMap = parsePricePlanMap().get(priceIdFound);
            if (fromMap != null) {
                return fromMap;
            }
        }
        return tierFromUserOnly(user);
    }

    private java.util.Map<String, String> parsePricePlanMap() {
        java.util.Map<String, String> m = new java.util.HashMap<>();
        if (subscriptionPlanByPrice == null || subscriptionPlanByPrice.isBlank()) {
            return m;
        }
        for (String part : subscriptionPlanByPrice.split(",")) {
            String[] kv = part.trim().split(":", 2);
            if (kv.length == 2) {
                m.put(kv[0].trim(), kv[1].trim().toUpperCase());
            }
        }
        return m;
    }

    /** Reactivates a subscription that was set to cancel at period end (undo cancel). */
    public void reactivateSubscription(Long userId) {
        Stripe.apiKey = stripeSecretKey;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String subId = user.getStripeSubscriptionId();
        if (subId == null || subId.isEmpty()) {
            throw new RuntimeException("No subscription to reactivate");
        }
        try {
            var params = com.stripe.param.SubscriptionUpdateParams.builder()
                    .setCancelAtPeriodEnd(false)
                    .build();
            Subscription.retrieve(subId).update(params);
        } catch (Exception e) {
            throw new RuntimeException("Failed to reactivate subscription: " + e.getMessage());
        }
    }

    /** Cancels the subscription at period end. */
    public void cancelSubscriptionAtPeriodEnd(Long userId) {
        Stripe.apiKey = stripeSecretKey;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String subId = user.getStripeSubscriptionId();
        if (subId == null || subId.isEmpty()) {
            throw new RuntimeException("No active subscription to cancel");
        }
        try {
            var params = com.stripe.param.SubscriptionUpdateParams.builder()
                    .setCancelAtPeriodEnd(true)
                    .build();
            Subscription.retrieve(subId).update(params);
        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel subscription: " + e.getMessage());
        }
    }

    public void handleWebhook(String payload, String sigHeader) {
        if (webhookSecret == null || webhookSecret.isEmpty()) {
            return;
        }
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            switch (event.getType()) {
                case "checkout.session.completed" -> {
                    Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (session != null && session.getSubscription() != null) {
                        String userId = session.getMetadata().get("userId");
                        String customerId = session.getCustomer();
                        String subId = session.getSubscription();
                        if (userId != null) handleSubscriptionCreated(customerId, subId, userId);
                    }
                }
                case "customer.subscription.deleted" -> {
                    Subscription sub = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (sub != null) handleSubscriptionDeleted(sub.getId());
                }
                default -> { }
            }
        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid webhook signature");
        } catch (Exception e) {
            throw new RuntimeException("Webhook error: " + e.getMessage());
        }
    }
}
