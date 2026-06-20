package com.adrian.inventory.dto;

import com.adrian.inventory.model.CreditNote;
import com.adrian.inventory.service.SriBillingService;

import java.util.List;

public record CreditNoteResponse(
        Long id,
        Long invoiceId,
        String invoiceDocumentNumber,
        String motivo,
        boolean restockStock,
        String createdAt,
        Double total,
        List<CreditNoteItemResponse> items,
        String sriStatus,
        String sriAccessKey,
        String sriAuthorizationNumber,
        String datilCreditNoteId,
        String sriErrorMessage,
        Integer sriSecuencial,
        String sriDocumentNumber,
        String sriRidePdfUrl,
        String sriXmlUrl,
        boolean canReissueSri
) {
    public static CreditNoteResponse from(CreditNote creditNote) {
        return new CreditNoteResponse(
                creditNote.getId(),
                creditNote.getInvoice().getId(),
                creditNote.getInvoice().getSriDocumentNumber(),
                creditNote.getMotivo(),
                creditNote.isRestockStock(),
                creditNote.getCreatedAt() == null ? null : creditNote.getCreatedAt().toString(),
                creditNote.getTotal(),
                creditNote.getItems().stream().map(CreditNoteItemResponse::from).toList(),
                creditNote.getSriStatus(),
                creditNote.getSriAccessKey(),
                creditNote.getSriAuthorizationNumber(),
                creditNote.getDatilCreditNoteId(),
                creditNote.getSriErrorMessage(),
                creditNote.getSriSecuencial(),
                creditNote.getSriDocumentNumber(),
                creditNote.getSriRidePdfUrl(),
                creditNote.getSriXmlUrl(),
                SriBillingService.canReissue(creditNote.getSriStatus()));
    }
}
