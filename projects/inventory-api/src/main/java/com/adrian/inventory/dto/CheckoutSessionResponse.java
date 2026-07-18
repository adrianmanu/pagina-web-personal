package com.adrian.inventory.dto;

public record CheckoutSessionResponse(
        String provider,
        String checkoutUrl,
        String message,
        PayPhoneCheckoutConfig payphone) {

    public static CheckoutSessionResponse stripe(String checkoutUrl, String message) {
        return new CheckoutSessionResponse("stripe", checkoutUrl, message, null);
    }

    public static CheckoutSessionResponse payphoneRedirect(String checkoutUrl, String message) {
        return new CheckoutSessionResponse("payphone", checkoutUrl, message, null);
    }

    public static CheckoutSessionResponse payphone(PayPhoneCheckoutConfig config, String message) {
        return new CheckoutSessionResponse("payphone", null, message, config);
    }
}
