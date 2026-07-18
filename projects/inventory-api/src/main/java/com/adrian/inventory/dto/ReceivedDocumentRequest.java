package com.adrian.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReceivedDocumentRequest(
        Long supplierId,
        @NotBlank String documentType,
        @NotBlank String documentNumber,
        String accessKey,
        String authorizationNumber,
        @NotNull LocalDate issueDate,
        @NotBlank String issuerName,
        @NotBlank String issuerTaxId,
        Double subtotal,
        Double iva,
        Double total,
        @NotBlank String sustentoCode,
        String notes
) {}
