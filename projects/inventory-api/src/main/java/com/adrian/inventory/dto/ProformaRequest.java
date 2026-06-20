package com.adrian.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ProformaRequest(
        boolean finalConsumer,
        Long customerId,
        String customerName,
        String customerTaxId,
        String customerEmail,
        String customerAddress,
        String notes,
        @NotEmpty @Valid List<InvoiceItemRequest> items
) {}
