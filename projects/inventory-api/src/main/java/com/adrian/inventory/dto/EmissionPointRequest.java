package com.adrian.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public record EmissionPointRequest(
        @NotBlank String establishmentCode,
        @NotBlank String emissionPointCode,
        @NotBlank String label,
        String address,
        Boolean defaultPoint
) {}
