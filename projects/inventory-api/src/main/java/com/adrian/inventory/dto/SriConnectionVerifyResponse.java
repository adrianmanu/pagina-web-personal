package com.adrian.inventory.dto;

public record SriConnectionVerifyResponse(
        boolean ok,
        String provider,
        int ambiente,
        String ruc,
        boolean apiConfigured,
        boolean hasCertificate,
        boolean certificateValid,
        String message) {}
