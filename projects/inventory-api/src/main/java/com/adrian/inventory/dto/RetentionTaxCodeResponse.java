package com.adrian.inventory.dto;

public record RetentionTaxCodeResponse(
        String id,
        String taxType,
        String retentionCode,
        double percentage,
        String label
) {}
