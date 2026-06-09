package com.adrian.inventory.dto;

import com.adrian.inventory.model.Product;

public record ProductResponse(
        Long id,
        String name,
        String sku,
        Integer stock,
        Double price,
        String category
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getStock(),
                product.getPrice(),
                product.getCategory()
        );
    }
}
