package com.adrian.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record WaybillItemRequest(
        Long productId,
        String description,
        String sku,
        @NotNull @Positive Integer quantity
) {}
