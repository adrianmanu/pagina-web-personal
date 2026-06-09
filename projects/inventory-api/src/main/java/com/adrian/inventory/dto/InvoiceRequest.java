package com.adrian.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record InvoiceRequest(
        boolean finalConsumer,
        String customerName,
        String customerTaxId,
        String customerEmail,
        String customerAddress,
        @NotEmpty @Valid List<InvoiceItemRequest> items
) {}
