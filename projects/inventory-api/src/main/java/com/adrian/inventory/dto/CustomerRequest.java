package com.adrian.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(
        @NotBlank String name,
        @NotBlank String taxId,
        String email,
        String address,
        String phone
) {}
