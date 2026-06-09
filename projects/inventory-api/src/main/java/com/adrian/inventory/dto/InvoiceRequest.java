package com.adrian.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record InvoiceRequest(
        @NotBlank String customerName,
        @NotEmpty @Valid List<InvoiceItemRequest> items
) {}
