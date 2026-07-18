package com.adrian.inventory.dto;

import com.adrian.inventory.model.PurchaseSettlementItem;

public record PurchaseSettlementItemResponse(
        Long id,
        Long productId,
        String description,
        String sku,
        Integer quantity,
        Double unitPrice,
        Double subtotal
) {
    public static PurchaseSettlementItemResponse from(PurchaseSettlementItem item) {
        return new PurchaseSettlementItemResponse(
                item.getId(),
                item.getProductId(),
                item.getDescription(),
                item.getSku(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal());
    }
}
