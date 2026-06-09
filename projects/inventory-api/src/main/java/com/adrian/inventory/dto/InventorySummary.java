package com.adrian.inventory.dto;

import java.util.List;

public record InventorySummary(
        long totalProducts,
        long totalStock,
        double inventoryValue,
        List<CategorySummary> byCategory
) {
    public record CategorySummary(String category, long products, long stock, double value) {}
}
