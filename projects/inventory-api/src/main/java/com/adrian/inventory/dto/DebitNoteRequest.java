package com.adrian.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record DebitNoteRequest(
        @NotNull Long invoiceId,
        @NotEmpty @Valid List<DebitNoteItemRequest> items
) {}
