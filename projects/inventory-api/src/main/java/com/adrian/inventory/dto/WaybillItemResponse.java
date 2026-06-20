package com.adrian.inventory.dto;

import com.adrian.inventory.model.WaybillItem;

public record WaybillItemResponse(
        Long id,
        Long productId,
        String productName,
        String sku,
        Integer quantity
) {
    public static WaybillItemResponse from(WaybillItem item) {
        return new WaybillItemResponse(
                item.getId(),
                item.getProductId(),
                item.getProductName(),
                item.getSku(),
                item.getQuantity());
    }
}
