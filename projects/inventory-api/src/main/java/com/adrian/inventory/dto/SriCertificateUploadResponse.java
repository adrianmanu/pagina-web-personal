package com.adrian.inventory.dto;

public record SriCertificateUploadResponse(
        boolean hasCertificate,
        String ruc,
        String legalName,
        String expiresAt,
        boolean taxpayerCreated,
        String message
) {}
