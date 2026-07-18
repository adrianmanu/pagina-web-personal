package com.adrian.inventory.dto;

public record MembershipBillingOptionResponse(
        int periodMonths,
        int periodDays,
        String label,
        double priceUsd,
        double pricePerMonthUsd,
        int savingsPercent) {}
