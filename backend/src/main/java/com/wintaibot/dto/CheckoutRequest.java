package com.wintaibot.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    @NotBlank(message = "Plan is required")
    private String plan;

    /** MONTHLY or YEARLY; defaults to MONTHLY when omitted. */
    private String billingInterval;

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public String getBillingInterval() {
        return billingInterval;
    }

    public void setBillingInterval(String billingInterval) {
        this.billingInterval = billingInterval;
    }
}
