package com.adrian.inventory.service;

public final class AtsDocumentParts {

    public record Parts(String establishment, String emissionPoint, String sequential) {}

    private AtsDocumentParts() {}

    public static Parts parse(String documentNumber) {
        if (documentNumber == null || documentNumber.isBlank()) {
            return new Parts("001", "001", "000000000");
        }
        String[] parts = documentNumber.trim().split("-");
        if (parts.length != 3) {
            return new Parts("001", "001", "000000000");
        }
        return new Parts(parts[0], parts[1], parts[2]);
    }
}
