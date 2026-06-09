package com.adrian.inventory.dto;

import com.adrian.inventory.model.Invoice;

import java.util.List;

public record InvoiceResponse(
        Long id,
        boolean finalConsumer,
        String customerName,
        String customerTaxId,
        String customerEmail,
        String customerAddress,
        String createdAt,
        Double total,
        List<InvoiceItemResponse> items
) {
    public static InvoiceResponse from(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.isFinalConsumer(),
                invoice.getCustomerName(),
                invoice.getCustomerTaxId(),
                invoice.getCustomerEmail(),
                invoice.getCustomerAddress(),
                invoice.getCreatedAt() == null ? null : invoice.getCreatedAt().toString(),
                invoice.getTotal(),
                invoice.getItems().stream().map(InvoiceItemResponse::from).toList()
        );
    }
}
