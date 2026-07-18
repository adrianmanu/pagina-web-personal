package com.adrian.inventory.dto;

public record PayPhoneCheckoutConfig(
        String token,
        String storeId,
        String clientTransactionId,
        int amount,
        int amountWithoutTax,
        int tax,
        String currency,
        String reference,
        String responseUrl) {}
