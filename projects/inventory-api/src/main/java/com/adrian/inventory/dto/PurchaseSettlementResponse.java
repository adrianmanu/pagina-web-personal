package com.adrian.inventory.dto;

import com.adrian.inventory.model.PurchaseSettlement;
import com.adrian.inventory.service.SriBillingService;

import java.util.List;

public record PurchaseSettlementResponse(
        Long id,
        Long supplierId,
        String supplierName,
        String supplierTaxId,
        String createdAt,
        Double total,
        List<PurchaseSettlementItemResponse> items,
        String sriStatus,
        String sriAccessKey,
        String sriAuthorizationNumber,
        String datilPurchaseSettlementId,
        String sriErrorMessage,
        Integer sriSecuencial,
        String sriDocumentNumber,
        String sriRidePdfUrl,
        String sriXmlUrl,
        boolean canReissueSri
) {
    public static PurchaseSettlementResponse from(PurchaseSettlement settlement) {
        return new PurchaseSettlementResponse(
                settlement.getId(),
                settlement.getSupplier().getId(),
                settlement.getSupplier().getName(),
                settlement.getSupplier().getTaxId(),
                settlement.getCreatedAt() == null ? null : settlement.getCreatedAt().toString(),
                settlement.getTotal(),
                settlement.getItems().stream().map(PurchaseSettlementItemResponse::from).toList(),
                settlement.getSriStatus(),
                settlement.getSriAccessKey(),
                settlement.getSriAuthorizationNumber(),
                settlement.getDatilPurchaseSettlementId(),
                settlement.getSriErrorMessage(),
                settlement.getSriSecuencial(),
                settlement.getSriDocumentNumber(),
                settlement.getSriRidePdfUrl(),
                settlement.getSriXmlUrl(),
                SriBillingService.canReissue(settlement.getSriStatus()));
    }
}
