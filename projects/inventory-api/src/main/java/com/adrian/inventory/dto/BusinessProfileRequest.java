package com.adrian.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public record BusinessProfileRequest(
        @NotBlank String businessName,
        @NotBlank String ruc,
        @NotBlank String razonSocial,
        String direccion,
        String emailNotificaciones
) {}
