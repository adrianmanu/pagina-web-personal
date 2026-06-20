package com.adrian.inventory.dto;

import com.adrian.inventory.model.Membership;
import com.adrian.inventory.model.MembershipPlan;
import com.adrian.inventory.model.MembershipStatus;

import java.time.LocalDateTime;

public record MembershipStatusResponse(
        MembershipPlan plan,
        MembershipStatus status,
        String provider,
        boolean canEmit,
        boolean enforcementEnabled,
        LocalDateTime trialEndsAt,
        LocalDateTime currentPeriodEnd,
        String message) {

    public static MembershipStatusResponse from(
            Membership membership,
            boolean canEmit,
            boolean enforcementEnabled,
            String message) {
        return new MembershipStatusResponse(
                membership.getPlan(),
                membership.getStatus(),
                membership.getProvider().name().toLowerCase(),
                canEmit,
                enforcementEnabled,
                membership.getTrialEndsAt(),
                membership.getCurrentPeriodEnd(),
                message);
    }
}
