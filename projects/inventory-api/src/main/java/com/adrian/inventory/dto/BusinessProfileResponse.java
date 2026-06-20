package com.adrian.inventory.dto;

import com.adrian.inventory.model.BusinessProfile;

public record BusinessProfileResponse(
        Long id,
        String businessName,
        String ruc,
        String razonSocial,
        String direccion,
        String emailNotificaciones,
        boolean onboardingCompleted,
        int onboardingStep
) {
    public static BusinessProfileResponse from(BusinessProfile profile) {
        return new BusinessProfileResponse(
                profile.getId(),
                profile.getBusinessName(),
                profile.getRuc(),
                profile.getRazonSocial(),
                profile.getDireccion(),
                profile.getEmailNotificaciones(),
                profile.isOnboardingCompleted(),
                profile.getOnboardingStep());
    }
}
