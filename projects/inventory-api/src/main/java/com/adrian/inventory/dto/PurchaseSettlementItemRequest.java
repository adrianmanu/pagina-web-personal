package com.adrian.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PurchaseSettlementItemRequest(
        Long productId,
        String description,
        String sku,
        @NotNull @Min(1) Integer quantity,
        @NotNull @Min(0) Double unitPrice
) {}
