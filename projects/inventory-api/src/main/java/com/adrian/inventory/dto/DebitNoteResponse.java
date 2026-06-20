package com.adrian.inventory.dto;

import com.adrian.inventory.model.DebitNote;
import com.adrian.inventory.service.SriBillingService;

import java.util.List;

public record DebitNoteResponse(
        Long id,
        Long invoiceId,
        String invoiceDocumentNumber,
        String createdAt,
        Double total,
        List<DebitNoteItemResponse> items,
        String sriStatus,
        String sriAccessKey,
        String sriAuthorizationNumber,
        String datilDebitNoteId,
        String sriErrorMessage,
        Integer sriSecuencial,
        String sriDocumentNumber,
        String sriRidePdfUrl,
        String sriXmlUrl,
        boolean canReissueSri
) {
    public static DebitNoteResponse from(DebitNote debitNote) {
        return new DebitNoteResponse(
                debitNote.getId(),
                debitNote.getInvoice().getId(),
                debitNote.getInvoice().getSriDocumentNumber(),
                debitNote.getCreatedAt() == null ? null : debitNote.getCreatedAt().toString(),
                debitNote.getTotal(),
                debitNote.getItems().stream().map(DebitNoteItemResponse::from).toList(),
                debitNote.getSriStatus(),
                debitNote.getSriAccessKey(),
                debitNote.getSriAuthorizationNumber(),
                debitNote.getDatilDebitNoteId(),
                debitNote.getSriErrorMessage(),
                debitNote.getSriSecuencial(),
                debitNote.getSriDocumentNumber(),
                debitNote.getSriRidePdfUrl(),
                debitNote.getSriXmlUrl(),
                SriBillingService.canReissue(debitNote.getSriStatus()));
    }
}
