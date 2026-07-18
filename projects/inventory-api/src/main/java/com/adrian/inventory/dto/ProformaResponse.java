package com.adrian.inventory.dto;

import com.adrian.inventory.model.Proforma;
import com.adrian.inventory.model.ProformaItem;

import java.util.List;

public record ProformaResponse(
        Long id,
        String status,
        String createdAt,
        boolean finalConsumer,
        String customerName,
        String customerTaxId,
        String customerEmail,
        String customerAddress,
        Double total,
        Long convertedInvoiceId,
        String notes,
        List<ProformaItemResponse> items
) {
    public record ProformaItemResponse(
            Long id,
            Long productId,
            String productName,
            String sku,
            Integer quantity,
            Double unitPrice,
            Double subtotal
    ) {
        public static ProformaItemResponse from(ProformaItem item) {
            double subtotal = (item.getQuantity() == null ? 0 : item.getQuantity())
                    * (item.getUnitPrice() == null ? 0 : item.getUnitPrice());
            return new ProformaItemResponse(
                    item.getId(),
                    item.getProductId(),
                    item.getProductName(),
                    item.getSku(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    Math.round(subtotal * 100.0) / 100.0);
        }
    }

    public static ProformaResponse from(Proforma proforma) {
        return new ProformaResponse(
                proforma.getId(),
                proforma.getStatus(),
                proforma.getCreatedAt() == null ? null : proforma.getCreatedAt().toString(),
                proforma.isFinalConsumer(),
                proforma.getCustomerName(),
                proforma.getCustomerTaxId(),
                proforma.getCustomerEmail(),
                proforma.getCustomerAddress(),
                proforma.getTotal(),
                proforma.getConvertedInvoiceId(),
                proforma.getNotes(),
                proforma.getItems().stream().map(ProformaItemResponse::from).toList());
    }
}
