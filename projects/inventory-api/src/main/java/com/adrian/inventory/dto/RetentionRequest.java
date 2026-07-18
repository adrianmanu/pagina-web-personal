package com.adrian.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record RetentionRequest(
        @NotNull Long supplierId,
        Long receivedDocumentId,
        String supportDocumentNumber,
        String supportDocumentType,
        LocalDate supportDocumentDate,
        @NotEmpty @Valid List<RetentionItemRequest> items
) {}
