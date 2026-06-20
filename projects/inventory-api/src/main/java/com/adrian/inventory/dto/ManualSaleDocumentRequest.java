package com.adrian.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ManualSaleDocumentRequest(
        @NotBlank String documentType,
        @NotBlank String documentNumber,
        @NotNull LocalDate issueDate,
        @NotBlank String customerName,
        @NotBlank String customerTaxId,
        String customerIdType,
        Double subtotal,
        Double iva,
        @NotNull Double total,
        String notes
) {}
