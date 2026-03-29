package com.wintaibot.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Checkout: either {@code url} for Stripe Checkout redirect, or {@code updated} when the
 * existing subscription was changed in place (no redirect).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CheckoutResponse {

    private String url;
    private boolean updated;
    private String message;

    public CheckoutResponse() {
    }

    public CheckoutResponse(String url) {
        this.url = url;
        this.updated = false;
    }

    public static CheckoutResponse updated(String message) {
        CheckoutResponse r = new CheckoutResponse();
        r.updated = true;
        r.message = message;
        return r;
    }

    public String getUrl() {
        return url;
    }

    /** Legacy field name used by some clients. */
    public String getCheckoutUrl() {
        return url;
    }

    public boolean isUpdated() {
        return updated;
    }

    public String getMessage() {
        return message;
    }
}
