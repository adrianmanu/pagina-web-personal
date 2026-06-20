package com.adrian.inventory.service.sri;

import com.adrian.inventory.config.FactuplanProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.CreditNote;
import com.adrian.inventory.model.DebitNote;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.PurchaseSettlement;
import com.adrian.inventory.model.ReceivedDocument;
import com.adrian.inventory.model.Retention;
import com.adrian.inventory.model.Waybill;
import com.adrian.inventory.service.BillingSequenceService;
import com.adrian.inventory.service.SriDocumentFields;
import com.adrian.inventory.service.SriDocumentNumber;
import com.adrian.inventory.service.SriDocumentType;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class FactuplanSriDocumentsService {

    private final FactuplanProperties factuplanProperties;
    private final FactuplanClient factuplanClient;
    private final FactuplanPayloadBuilders payloadBuilders;
    private final SriEmitterResolver emitterResolver;
    private final BillingSequenceService sequenceService;

    public FactuplanSriDocumentsService(
            FactuplanProperties factuplanProperties,
            FactuplanClient factuplanClient,
            FactuplanPayloadBuilders payloadBuilders,
            SriEmitterResolver emitterResolver,
            BillingSequenceService sequenceService) {
        this.factuplanProperties = factuplanProperties;
        this.factuplanClient = factuplanClient;
        this.payloadBuilders = payloadBuilders;
        this.emitterResolver = emitterResolver;
        this.sequenceService = sequenceService;
    }

    public boolean isEnabled() {
        return factuplanProperties.isEnabled() && factuplanProperties.isApiKeyConfigured();
    }

    public void emitCreditNote(CreditNote creditNote) {
        SriEmitterContext emitter = requireEmitter(creditNote.getUser());
        if (!isEnabled()) {
            creditNote.setSriStatus("DISABLED");
            return;
        }

        Invoice invoice = creditNote.getInvoice();
        String accessKey = requireInvoiceAccessKey(invoice, emitter);

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.CREDIT_NOTE);
        creditNote.setSriSecuencial(secuencial);
        creditNote.setSriDocumentNumber(SriDocumentNumber.format(
                emitter.establecimientoCodigo(), emitter.puntoEmision(), secuencial));

        try {
            JsonNode response = factuplanClient.createCreditNote(
                    payloadBuilders.creditNote(creditNote, accessKey, emitter),
                    emitter.ruc(),
                    "stockflow-cn-" + creditNote.getId());
            applyResponse(creditNote, response, emitter);
            pollCreditNote(creditNote, emitter);
        } catch (ApiException ex) {
            creditNote.setSriStatus("ERROR");
            creditNote.setSriErrorMessage(truncate(ex.getMessage()));
        }
    }

    public void refreshCreditNote(CreditNote creditNote) {
        SriEmitterContext emitter = emitterResolver.resolve(creditNote.getUser());
        refreshReceipt(creditNote.getDatilCreditNoteId(), emitter,
                data -> SriDocumentFields.fromFactuplan(data, emitter).applyTo(creditNote, emitter));
    }

    public void emitDebitNote(DebitNote debitNote) {
        SriEmitterContext emitter = requireEmitter(debitNote.getUser());
        if (!isEnabled()) {
            debitNote.setSriStatus("DISABLED");
            return;
        }

        String accessKey = requireInvoiceAccessKey(debitNote.getInvoice(), emitter);
        int secuencial = sequenceService.nextSecuencial(SriDocumentType.DEBIT_NOTE);
        debitNote.setSriSecuencial(secuencial);
        debitNote.setSriDocumentNumber(SriDocumentNumber.format(
                emitter.establecimientoCodigo(), emitter.puntoEmision(), secuencial));

        try {
            JsonNode response = factuplanClient.createDebitNote(
                    payloadBuilders.debitNote(debitNote, accessKey),
                    emitter.ruc(),
                    "stockflow-dn-" + debitNote.getId());
            applyResponse(debitNote, response, emitter);
            pollDebitNote(debitNote, emitter);
        } catch (ApiException ex) {
            debitNote.setSriStatus("ERROR");
            debitNote.setSriErrorMessage(truncate(ex.getMessage()));
        }
    }

    public void refreshDebitNote(DebitNote debitNote) {
        SriEmitterContext emitter = emitterResolver.resolve(debitNote.getUser());
        refreshReceipt(debitNote.getDatilDebitNoteId(), emitter,
                data -> SriDocumentFields.fromFactuplan(data, emitter).applyTo(debitNote, emitter));
    }

    public void reissueDebitNote(DebitNote debitNote) {
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Reemisión de notas de débito con Factuplan no está soportada; cree una nueva nota");
    }

    public void emitWaybill(Waybill waybill) {
        SriEmitterContext emitter = requireEmitter(waybill.getUser());
        if (!isEnabled()) {
            waybill.setSriStatus("DISABLED");
            return;
        }

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.WAYBILL);
        waybill.setSriSecuencial(secuencial);
        waybill.setSriDocumentNumber(SriDocumentNumber.format(
                emitter.establecimientoCodigo(), emitter.puntoEmision(), secuencial));

        try {
            JsonNode response = factuplanClient.createWaybill(
                    payloadBuilders.waybill(waybill, emitter),
                    emitter.ruc(),
                    "stockflow-wb-" + waybill.getId());
            applyResponse(waybill, response, emitter);
            pollWaybill(waybill, emitter);
        } catch (ApiException ex) {
            waybill.setSriStatus("ERROR");
            waybill.setSriErrorMessage(truncate(ex.getMessage()));
        }
    }

    public void refreshWaybill(Waybill waybill) {
        SriEmitterContext emitter = emitterResolver.resolve(waybill.getUser());
        refreshReceipt(waybill.getDatilWaybillId(), emitter,
                data -> SriDocumentFields.fromFactuplan(data, emitter).applyTo(waybill, emitter));
    }

    public void reissueWaybill(Waybill waybill) {
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Reemisión de guías con Factuplan no está soportada; cree una nueva guía");
    }

    public void emitRetention(Retention retention) {
        SriEmitterContext emitter = requireEmitter(retention.getUser());
        if (!isEnabled()) {
            retention.setSriStatus("DISABLED");
            return;
        }
        if (!emitter.agenteRetencion()) {
            retention.setSriStatus("DISABLED");
            retention.setSriErrorMessage("El emisor no está configurado como agente de retención");
            return;
        }

        String accessKey = resolveRetentionAccessKey(retention, emitter);
        int secuencial = sequenceService.nextSecuencial(SriDocumentType.RETENTION);
        retention.setSriSecuencial(secuencial);
        retention.setSriDocumentNumber(SriDocumentNumber.format(
                emitter.establecimientoCodigo(), emitter.puntoEmision(), secuencial));

        try {
            JsonNode response = factuplanClient.createWithholding(
                    payloadBuilders.withholding(retention, accessKey),
                    emitter.ruc(),
                    "stockflow-ret-" + retention.getId());
            applyResponse(retention, response, emitter);
            pollRetention(retention, emitter);
        } catch (ApiException ex) {
            retention.setSriStatus("ERROR");
            retention.setSriErrorMessage(truncate(ex.getMessage()));
        }
    }

    public void refreshRetention(Retention retention) {
        SriEmitterContext emitter = emitterResolver.resolve(retention.getUser());
        refreshReceipt(retention.getDatilRetentionId(), emitter,
                data -> SriDocumentFields.fromFactuplan(data, emitter).applyTo(retention, emitter));
    }

    public void reissueRetention(Retention retention) {
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Reemisión de retenciones con Factuplan no está soportada; cree una nueva retención");
    }

    public void emitPurchaseSettlement(PurchaseSettlement settlement) {
        settlement.setSriStatus("DISABLED");
        settlement.setSriErrorMessage(
                "Liquidación de compra: Factuplan aún no expone endpoint REST; disponible vía sign-and-authorize en fase futura");
    }

    public void refreshPurchaseSettlement(PurchaseSettlement settlement) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Liquidación de compra no disponible con Factuplan");
    }

    public void reissuePurchaseSettlement(PurchaseSettlement settlement) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Liquidación de compra no disponible con Factuplan");
    }

    private String requireInvoiceAccessKey(Invoice invoice, SriEmitterContext emitter) {
        String accessKey = invoice.getSriAccessKey();
        if (accessKey != null && accessKey.length() == 49) {
            return accessKey;
        }
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "La factura origen no tiene clave de acceso SRI (49 dígitos). Refresque su estado SRI primero.");
    }

    private String resolveRetentionAccessKey(Retention retention, SriEmitterContext emitter) {
        ReceivedDocument received = retention.getReceivedDocument();
        if (received != null && received.getAccessKey() != null && received.getAccessKey().length() == 49) {
            return received.getAccessKey();
        }
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "El documento sustento debe tener clave de acceso SRI de 49 dígitos para retener con Factuplan");
    }

    private SriEmitterContext requireEmitter(com.adrian.inventory.model.User user) {
        return emitterResolver.require(user);
    }

    private void refreshReceipt(String receiptId, SriEmitterContext emitter, java.util.function.Consumer<JsonNode> applier) {
        if (receiptId == null || receiptId.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El comprobante no tiene ID del proveedor SRI");
        }
        JsonNode status = factuplanClient.getReceiptStatus(receiptId, emitter.ruc());
        applier.accept(FactuplanClient.unwrapData(status));
    }

    private void applyResponse(CreditNote creditNote, JsonNode response, SriEmitterContext emitter) {
        SriDocumentFields.fromFactuplan(FactuplanClient.unwrapData(response), emitter).applyTo(creditNote, emitter);
    }

    private void applyResponse(DebitNote debitNote, JsonNode response, SriEmitterContext emitter) {
        SriDocumentFields.fromFactuplan(FactuplanClient.unwrapData(response), emitter).applyTo(debitNote, emitter);
    }

    private void applyResponse(Waybill waybill, JsonNode response, SriEmitterContext emitter) {
        SriDocumentFields.fromFactuplan(FactuplanClient.unwrapData(response), emitter).applyTo(waybill, emitter);
    }

    private void applyResponse(Retention retention, JsonNode response, SriEmitterContext emitter) {
        SriDocumentFields.fromFactuplan(FactuplanClient.unwrapData(response), emitter).applyTo(retention, emitter);
    }

    private void pollCreditNote(CreditNote creditNote, SriEmitterContext emitter) {
        pollUntilSettled(() -> {
            refreshCreditNote(creditNote);
            return creditNote.getSriStatus();
        });
    }

    private void pollDebitNote(DebitNote debitNote, SriEmitterContext emitter) {
        pollUntilSettled(() -> {
            refreshDebitNote(debitNote);
            return debitNote.getSriStatus();
        });
    }

    private void pollWaybill(Waybill waybill, SriEmitterContext emitter) {
        pollUntilSettled(() -> {
            refreshWaybill(waybill);
            return waybill.getSriStatus();
        });
    }

    private void pollRetention(Retention retention, SriEmitterContext emitter) {
        pollUntilSettled(() -> {
            refreshRetention(retention);
            return retention.getSriStatus();
        });
    }

    private void pollUntilSettled(java.util.function.Supplier<String> statusSupplier) {
        if (!shouldPoll(statusSupplier.get())) {
            return;
        }
        for (int attempt = 0; attempt < 20; attempt++) {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                return;
            }
            try {
                if (!shouldPoll(statusSupplier.get())) {
                    return;
                }
            } catch (ApiException ex) {
                return;
            }
        }
    }

    private boolean shouldPoll(String status) {
        if (status == null) {
            return true;
        }
        String normalized = status.toUpperCase();
        return "PROCESSING".equals(normalized)
                || "RECIBIDO".equals(normalized)
                || "PENDIENTE".equals(normalized)
                || "ENVIADO".equals(normalized);
    }

    private static String truncate(String message) {
        if (message == null) return null;
        return message.length() > 1000 ? message.substring(0, 997) + "…" : message;
    }
}
