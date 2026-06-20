package com.adrian.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreditNoteItemRequest(
        @NotNull Long invoiceItemId,
        @NotNull @Min(1) Integer quantity
) {}
