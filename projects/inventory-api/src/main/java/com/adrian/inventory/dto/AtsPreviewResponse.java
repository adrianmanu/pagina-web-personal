package com.adrian.inventory.dto;

import java.util.List;

public record AtsPreviewResponse(
        int year,
        int month,
        String periodLabel,
        String informantRuc,
        String informantName,
        String establishmentCode,
        double totalVentas,
        AtsTotalsResponse purchases,
        AtsTotalsResponse salesManual,
        AtsTotalsResponse salesElectronic,
        AtsTotalsResponse creditNotes,
        AtsTotalsResponse retentionsIssued,
        List<AtsLineResponse> purchaseLines,
        List<AtsLineResponse> saleManualLines,
        List<AtsLineResponse> saleElectronicLines,
        List<AtsLineResponse> creditNoteLines,
        List<AtsLineResponse> retentionLines,
        List<AtsValidationResponse> validations,
        boolean readyToExport,
        String exportFileName
) {
    public record AtsLineResponse(
            String section,
            String documentType,
            String documentNumber,
            String partyName,
            String partyTaxId,
            String issueDate,
            String sriStatus,
            Double subtotal,
            Double iva,
            Double total,
            String sustentoCode,
            String notes
    ) {}

    public record AtsTotalsResponse(
            double subtotal,
            double iva,
            double total,
            int documentCount
    ) {}

    public record AtsValidationResponse(
            String level,
            String message
    ) {}
}
