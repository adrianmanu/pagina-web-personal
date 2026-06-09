package com.adrian.inventory.dto;

import com.adrian.inventory.model.Invoice;

import java.util.List;

public record InvoiceResponse(
        Long id,
        String customerName,
        String createdAt,
        Double total,
        List<InvoiceItemResponse> items
) {
    public static InvoiceResponse from(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getCustomerName(),
                invoice.getCreatedAt() == null ? null : invoice.getCreatedAt().toString(),
                invoice.getTotal(),
                invoice.getItems().stream().map(InvoiceItemResponse::from).toList()
        );
    }
}
