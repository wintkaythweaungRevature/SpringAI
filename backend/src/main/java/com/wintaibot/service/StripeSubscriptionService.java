package com.wintaibot.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.wintaibot.entity.User;
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

    @Value("${app.success-url:http://localhost:3000}")
    private String successUrl;

    @Value("${app.cancel-url:http://localhost:3000}")
    private String cancelUrl;

    private final UserRepository userRepository;

    public StripeSubscriptionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String createCheckoutSession(Long userId) {
        Stripe.apiKey = stripeSecretKey;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build()
                )
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .putMetadata("userId", String.valueOf(userId))
                .setCustomerEmail(user.getEmail())
                .build();

        try {
            Session session = Session.create(params);
            return session.getUrl();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create checkout session: " + e.getMessage());
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
