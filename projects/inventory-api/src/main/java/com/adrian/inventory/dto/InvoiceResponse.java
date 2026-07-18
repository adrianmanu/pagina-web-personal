package com.adrian.inventory.dto;

import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.service.SriBillingService;

import java.util.List;

public record InvoiceResponse(
        Long id,
        Long customerId,
        boolean finalConsumer,
        String customerName,
        String customerTaxId,
        String customerEmail,
        String customerAddress,
        String createdAt,
        Double total,
        List<InvoiceItemResponse> items,
        String sriStatus,
        String sriAccessKey,
        String sriAuthorizationNumber,
        String datilInvoiceId,
        String sriErrorMessage,
        Integer sriSecuencial,
        String sriDocumentNumber,
        String sriRidePdfUrl,
        String sriXmlUrl,
        boolean canReissueSri
) {
    public static InvoiceResponse from(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getCustomer() != null ? invoice.getCustomer().getId() : null,
                invoice.isFinalConsumer(),
                invoice.getCustomerName(),
                invoice.getCustomerTaxId(),
                invoice.getCustomerEmail(),
                invoice.getCustomerAddress(),
                invoice.getCreatedAt() == null ? null : invoice.getCreatedAt().toString(),
                invoice.getTotal(),
                invoice.getItems().stream().map(InvoiceItemResponse::from).toList(),
                invoice.getSriStatus(),
                invoice.getSriAccessKey(),
                invoice.getSriAuthorizationNumber(),
                invoice.getDatilInvoiceId(),
                invoice.getSriErrorMessage(),
                invoice.getSriSecuencial(),
                invoice.getSriDocumentNumber(),
                invoice.getSriRidePdfUrl(),
                invoice.getSriXmlUrl(),
                SriBillingService.canReissue(invoice.getSriStatus())
        );
    }
}
