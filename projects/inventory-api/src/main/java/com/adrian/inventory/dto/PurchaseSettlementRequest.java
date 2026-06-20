package com.adrian.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PurchaseSettlementRequest(
        @NotNull Long supplierId,
        @NotEmpty @Valid List<PurchaseSettlementItemRequest> items
) {}
