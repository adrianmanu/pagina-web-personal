package com.adrian.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record WaybillRequest(
        Long invoiceId,
        @NotBlank String direccionPartida,
        @NotBlank String motivoTraslado,
        String ruta,
        @NotBlank String carrierName,
        @NotBlank String carrierTaxId,
        @NotBlank String carrierPlate,
        String carrierEmail,
        String carrierAddress,
        String carrierPhone,
        @NotBlank String recipientName,
        @NotBlank String recipientTaxId,
        String recipientEmail,
        @NotBlank String recipientAddress,
        String recipientPhone,
        @NotEmpty @Valid List<WaybillItemRequest> items
) {}
