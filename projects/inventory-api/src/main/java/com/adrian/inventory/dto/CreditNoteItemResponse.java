package com.adrian.inventory.dto;

import com.adrian.inventory.model.CreditNoteItem;

public record CreditNoteItemResponse(
        Long invoiceItemId,
        Long productId,
        String productName,
        String sku,
        Integer quantity,
        Double unitPrice,
        Double subtotal
) {
    public static CreditNoteItemResponse from(CreditNoteItem item) {
        double unitPrice = item.getUnitPrice() == null ? 0 : item.getUnitPrice();
        int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
        return new CreditNoteItemResponse(
                item.getInvoiceItemId(),
                item.getProductId(),
                item.getProductName(),
                item.getSku(),
                quantity,
                unitPrice,
                Math.round(unitPrice * quantity * 100.0) / 100.0);
    }
}
