package com.adrian.inventory.dto;

import com.adrian.inventory.model.ManualSaleDocument;

public record ManualSaleDocumentResponse(
        Long id,
        String documentType,
        String documentNumber,
        String issueDate,
        String customerName,
        String customerTaxId,
        String customerIdType,
        Double subtotal,
        Double iva,
        Double total,
        String notes,
        String createdAt
) {
    public static ManualSaleDocumentResponse from(ManualSaleDocument document) {
        return new ManualSaleDocumentResponse(
                document.getId(),
                document.getDocumentType(),
                document.getDocumentNumber(),
                document.getIssueDate() == null ? null : document.getIssueDate().toString(),
                document.getCustomerName(),
                document.getCustomerTaxId(),
                document.getCustomerIdType(),
                document.getSubtotal(),
                document.getIva(),
                document.getTotal(),
                document.getNotes(),
                document.getCreatedAt() == null ? null : document.getCreatedAt().toString());
    }
}
