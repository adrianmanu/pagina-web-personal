package com.adrian.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RetentionItemRequest(
        @NotBlank String retentionCodeId,
        @NotNull @DecimalMin("0.01") Double taxableBase
) {}
