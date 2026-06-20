package com.adrian.inventory.dto;

import com.adrian.inventory.model.User;
import com.adrian.inventory.model.UserRole;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String role,
        boolean onboardingCompleted,
        int onboardingStep,
        String membershipStatus,
        String membershipPlan,
        boolean canEmit
) {
    public static UserResponse from(
            User user,
            boolean onboardingCompleted,
            int onboardingStep,
            String membershipStatus,
            String membershipPlan,
            boolean canEmit) {
        UserRole role = user.getRole() == null ? UserRole.ADMIN : user.getRole();
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                role.name(),
                onboardingCompleted,
                onboardingStep,
                membershipStatus,
                membershipPlan,
                canEmit);
    }

    public static UserResponse from(User user, boolean onboardingCompleted, int onboardingStep) {
        return from(user, onboardingCompleted, onboardingStep, "TRIAL", "TRIAL", true);
    }
}
