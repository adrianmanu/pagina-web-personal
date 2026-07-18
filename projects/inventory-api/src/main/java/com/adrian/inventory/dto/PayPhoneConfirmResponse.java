package com.adrian.inventory.dto;

public record PayPhoneConfirmResponse(
        boolean approved,
        String transactionStatus,
        String message,
        MembershipStatusResponse membership) {}
