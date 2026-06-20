package com.adrian.inventory.dto;

import com.adrian.inventory.model.RetentionItem;

public record RetentionItemResponse(
        Long id,
        String taxType,
        String retentionCode,
        String retentionLabel,
        Double percentage,
        Double taxableBase,
        Double retainedAmount
) {
    public static RetentionItemResponse from(RetentionItem item) {
        return new RetentionItemResponse(
                item.getId(),
                item.getTaxType(),
                item.getRetentionCode(),
                item.getRetentionLabel(),
                item.getPercentage(),
                item.getTaxableBase(),
                item.getRetainedAmount());
    }
}
