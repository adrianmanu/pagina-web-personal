package com.adrian.inventory.dto;

import com.adrian.inventory.model.DebitNoteItem;

public record DebitNoteItemResponse(
        Long id,
        String motivo,
        Double amount,
        Double subtotal
) {
    public static DebitNoteItemResponse from(DebitNoteItem item) {
        double amount = item.getAmount() == null ? 0 : item.getAmount();
        return new DebitNoteItemResponse(item.getId(), item.getMotivo(), amount, amount);
    }
}
