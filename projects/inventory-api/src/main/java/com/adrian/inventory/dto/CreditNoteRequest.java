package com.adrian.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreditNoteRequest(
        @NotNull Long invoiceId,
        @NotBlank String motivo,
        boolean restockStock,
        boolean fullCredit,
        @Valid List<CreditNoteItemRequest> items
) {}
