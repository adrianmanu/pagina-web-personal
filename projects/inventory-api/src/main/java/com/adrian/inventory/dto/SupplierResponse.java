package com.adrian.inventory.dto;

import com.adrian.inventory.model.Supplier;
import com.adrian.inventory.service.TaxIdValidator;

public record SupplierResponse(
        Long id,
        String name,
        String taxId,
        String idType,
        String email,
        String address,
        String phone,
        long settlementCount,
        double totalSettled
) {
    public static SupplierResponse from(Supplier supplier, long settlementCount, double totalSettled) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getTaxId(),
                TaxIdValidator.idTypeLabel(supplier.getTaxId()),
                supplier.getEmail(),
                supplier.getAddress(),
                supplier.getPhone(),
                settlementCount,
                Math.round(totalSettled * 100.0) / 100.0);
    }
}
