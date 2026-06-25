package com.adrian.inventory.dto;

import com.adrian.inventory.model.MembershipPlan;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(@NotNull MembershipPlan plan, int periodMonths) {
    public CheckoutRequest {
        if (periodMonths <= 0) {
            periodMonths = 1;
        }
    }
}
