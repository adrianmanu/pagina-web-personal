package com.adrian.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public record ReceivedDocumentUploadRequest(
        @NotBlank String xml,
        String sustentoCode,
        String notes
) {}
