package com.adrian.inventory.dto;

import com.adrian.inventory.model.MembershipPlan;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(@NotNull MembershipPlan plan) {}
