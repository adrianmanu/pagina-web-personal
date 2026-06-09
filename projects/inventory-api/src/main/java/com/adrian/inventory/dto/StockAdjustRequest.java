package com.adrian.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockAdjustRequest(@NotNull @Min(1) Integer quantity) {}
