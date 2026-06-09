package com.adrian.inventory.dto;

import com.adrian.inventory.model.InvoiceItem;

public record InvoiceItemResponse(
        Long productId,
        String productName,
        String sku,
        Integer quantity,
        Double unitPrice,
        Double subtotal
) {
    public static InvoiceItemResponse from(InvoiceItem item) {
        int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
        double unitPrice = item.getUnitPrice() == null ? 0 : item.getUnitPrice();
        double subtotal = Math.round(quantity * unitPrice * 100.0) / 100.0;
        return new InvoiceItemResponse(
                item.getProductId(),
                item.getProductName(),
                item.getSku(),
                item.getQuantity(),
                item.getUnitPrice(),
                subtotal
        );
    }
}
