package com.adrian.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DebitNoteItemRequest(
        @NotBlank String motivo,
        @NotNull @Positive Double amount
) {}
