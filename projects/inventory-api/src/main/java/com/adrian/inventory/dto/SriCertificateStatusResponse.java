package com.adrian.inventory.dto;

public record SriCertificateStatusResponse(
        boolean valid,
        boolean hasCertificate,
        String ruc,
        String legalName,
        String expiresAt,
        Integer daysUntilExpiry
) {}
