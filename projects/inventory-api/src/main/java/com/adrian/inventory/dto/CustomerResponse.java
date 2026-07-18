package com.adrian.inventory.dto;

import com.adrian.inventory.model.Customer;
import com.adrian.inventory.service.TaxIdValidator;

public record CustomerResponse(
        Long id,
        String name,
        String taxId,
        String idType,
        String email,
        String address,
        String phone,
        long invoiceCount,
        double totalInvoiced
) {
    public static CustomerResponse from(Customer customer, long invoiceCount, double totalInvoiced) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getTaxId(),
                TaxIdValidator.idTypeLabel(customer.getTaxId()),
                customer.getEmail(),
                customer.getAddress(),
                customer.getPhone(),
                invoiceCount,
                Math.round(totalInvoiced * 100.0) / 100.0);
    }
}
