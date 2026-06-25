package com.adrian.inventory.dto;

import com.adrian.inventory.model.MembershipPlan;

import java.util.List;

public record MembershipPlanResponse(
        MembershipPlan id,
        String name,
        String description,
        double monthlyPriceUsd,
        List<String> benefits,
        boolean recommended,
        List<MembershipBillingOptionResponse> billingOptions) {}
