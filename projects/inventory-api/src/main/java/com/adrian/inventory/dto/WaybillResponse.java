package com.adrian.inventory.dto;

import com.adrian.inventory.model.Waybill;
import com.adrian.inventory.service.SriBillingService;

import java.util.List;

public record WaybillResponse(
        Long id,
        Long invoiceId,
        String invoiceDocumentNumber,
        String createdAt,
        String direccionPartida,
        String motivoTraslado,
        String ruta,
        String carrierName,
        String carrierTaxId,
        String carrierPlate,
        String recipientName,
        String recipientTaxId,
        String recipientAddress,
        List<WaybillItemResponse> items,
        String sriStatus,
        String sriAccessKey,
        String sriAuthorizationNumber,
        String datilWaybillId,
        String sriErrorMessage,
        Integer sriSecuencial,
        String sriDocumentNumber,
        String sriRidePdfUrl,
        String sriXmlUrl,
        boolean canReissueSri
) {
    public static WaybillResponse from(Waybill waybill) {
        return new WaybillResponse(
                waybill.getId(),
                waybill.getInvoice() != null ? waybill.getInvoice().getId() : null,
                waybill.getInvoice() != null ? waybill.getInvoice().getSriDocumentNumber() : null,
                waybill.getCreatedAt() == null ? null : waybill.getCreatedAt().toString(),
                waybill.getDireccionPartida(),
                waybill.getMotivoTraslado(),
                waybill.getRuta(),
                waybill.getCarrierName(),
                waybill.getCarrierTaxId(),
                waybill.getCarrierPlate(),
                waybill.getRecipientName(),
                waybill.getRecipientTaxId(),
                waybill.getRecipientAddress(),
                waybill.getItems().stream().map(WaybillItemResponse::from).toList(),
                waybill.getSriStatus(),
                waybill.getSriAccessKey(),
                waybill.getSriAuthorizationNumber(),
                waybill.getDatilWaybillId(),
                waybill.getSriErrorMessage(),
                waybill.getSriSecuencial(),
                waybill.getSriDocumentNumber(),
                waybill.getSriRidePdfUrl(),
                waybill.getSriXmlUrl(),
                SriBillingService.canReissue(waybill.getSriStatus()));
    }
}
