package com.adrian.inventory.service;

import com.adrian.inventory.dto.MembershipBillingOptionResponse;
import com.adrian.inventory.model.MembershipBillingPeriod;
import com.adrian.inventory.model.MembershipPlan;

import java.util.Arrays;
import java.util.List;

public final class MembershipPricing {

    private MembershipPricing() {}

    public static double monthlyPriceUsd(MembershipPlan plan) {
        return switch (plan) {
            case STARTER -> 19.0;
            case PRO -> 39.0;
            default -> throw new IllegalArgumentException("Plan sin precio: " + plan);
        };
    }

    public static int amountCents(MembershipPlan plan, MembershipBillingPeriod period) {
        double total = totalPriceUsd(plan, period);
        return (int) Math.round(total * 100);
    }

    public static double totalPriceUsd(MembershipPlan plan, MembershipBillingPeriod period) {
        double monthly = monthlyPriceUsd(plan);
        double multiplier = 1.0 - (period.getSavingsPercent() / 100.0);
        double raw = monthly * period.getMonths() * multiplier;
        return Math.round(raw * 100.0) / 100.0;
    }

    public static double pricePerMonthUsd(MembershipPlan plan, MembershipBillingPeriod period) {
        double total = totalPriceUsd(plan, period);
        return Math.round((total / period.getMonths()) * 100.0) / 100.0;
    }

    public static List<MembershipBillingOptionResponse> billingOptions(MembershipPlan plan) {
        return Arrays.stream(MembershipBillingPeriod.values())
                .map(period -> new MembershipBillingOptionResponse(
                        period.getMonths(),
                        period.getDays(),
                        period.getLabel(),
                        totalPriceUsd(plan, period),
                        pricePerMonthUsd(plan, period),
                        period.getSavingsPercent()))
                .toList();
    }
}
