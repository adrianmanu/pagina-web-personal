package com.adrian.inventory.dto;

import com.adrian.inventory.model.Retention;
import com.adrian.inventory.service.SriBillingService;

import java.util.List;

public record RetentionResponse(
        Long id,
        Long supplierId,
        String supplierName,
        String supplierTaxId,
        Long receivedDocumentId,
        String receivedDocumentNumber,
        String createdAt,
        String supportDocumentNumber,
        String supportDocumentType,
        String supportDocumentDate,
        String periodoFiscal,
        Double totalRetained,
        List<RetentionItemResponse> items,
        String sriStatus,
        String sriAccessKey,
        String sriAuthorizationNumber,
        String datilRetentionId,
        String sriErrorMessage,
        Integer sriSecuencial,
        String sriDocumentNumber,
        String sriRidePdfUrl,
        String sriXmlUrl,
        boolean canReissueSri
) {
    public static RetentionResponse from(Retention retention) {
        return new RetentionResponse(
                retention.getId(),
                retention.getSupplier().getId(),
                retention.getSupplier().getName(),
                retention.getSupplier().getTaxId(),
                retention.getReceivedDocument() == null ? null : retention.getReceivedDocument().getId(),
                retention.getReceivedDocument() == null ? null : retention.getReceivedDocument().getDocumentNumber(),
                retention.getCreatedAt() == null ? null : retention.getCreatedAt().toString(),
                retention.getSupportDocumentNumber(),
                retention.getSupportDocumentType(),
                retention.getSupportDocumentDate() == null
                        ? null
                        : retention.getSupportDocumentDate().toString(),
                retention.getPeriodoFiscal(),
                retention.getTotalRetained(),
                retention.getItems().stream().map(RetentionItemResponse::from).toList(),
                retention.getSriStatus(),
                retention.getSriAccessKey(),
                retention.getSriAuthorizationNumber(),
                retention.getDatilRetentionId(),
                retention.getSriErrorMessage(),
                retention.getSriSecuencial(),
                retention.getSriDocumentNumber(),
                retention.getSriRidePdfUrl(),
                retention.getSriXmlUrl(),
                SriBillingService.canReissue(retention.getSriStatus()));
    }
}
