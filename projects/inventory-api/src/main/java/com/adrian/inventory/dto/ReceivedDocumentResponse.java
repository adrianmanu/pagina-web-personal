package com.adrian.inventory.dto;

import com.adrian.inventory.model.ReceivedDocument;
import com.adrian.inventory.service.SustentoCatalog;

public record ReceivedDocumentResponse(
        Long id,
        Long supplierId,
        String supplierName,
        String source,
        String documentType,
        String documentNumber,
        String accessKey,
        String authorizationNumber,
        String issueDate,
        String issuerName,
        String issuerTaxId,
        Double subtotal,
        Double iva,
        Double total,
        String sustentoCode,
        String sustentoLabel,
        String sustentoCategory,
        String notes,
        String createdAt,
        boolean hasXml
) {
    public static ReceivedDocumentResponse from(ReceivedDocument document) {
        String sustentoCode = document.getSustentoCode();
        String category = SustentoCatalog.all().stream()
                .filter(item -> item.code().equals(sustentoCode))
                .map(SustentoCodeResponse::category)
                .findFirst()
                .orElse(null);

        return new ReceivedDocumentResponse(
                document.getId(),
                document.getSupplier() == null ? null : document.getSupplier().getId(),
                document.getSupplier() == null ? null : document.getSupplier().getName(),
                document.getSource(),
                document.getDocumentType(),
                document.getDocumentNumber(),
                document.getAccessKey(),
                document.getAuthorizationNumber(),
                document.getIssueDate() == null ? null : document.getIssueDate().toString(),
                document.getIssuerName(),
                document.getIssuerTaxId(),
                document.getSubtotal(),
                document.getIva(),
                document.getTotal(),
                sustentoCode,
                SustentoCatalog.labelFor(sustentoCode),
                category,
                document.getNotes(),
                document.getCreatedAt() == null ? null : document.getCreatedAt().toString(),
                document.getXmlContent() != null && !document.getXmlContent().isBlank());
    }
}
