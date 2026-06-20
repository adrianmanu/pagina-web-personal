package com.adrian.inventory.service.sri;

import com.adrian.inventory.config.FactuplanProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.service.BillingSequenceService;
import com.adrian.inventory.service.SriDocumentFields;
import com.adrian.inventory.service.SriDocumentNumber;
import com.adrian.inventory.service.SriDocumentType;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FactuplanSriInvoiceAdapter implements SriInvoicePort {

    private final FactuplanProperties factuplanProperties;
    private final FactuplanClient factuplanClient;
    private final FactuplanInvoicePayloadBuilder payloadBuilder;
    private final BillingSequenceService sequenceService;
    private final SriEmitterResolver emitterResolver;

    public FactuplanSriInvoiceAdapter(
            FactuplanProperties factuplanProperties,
            FactuplanClient factuplanClient,
            FactuplanInvoicePayloadBuilder payloadBuilder,
            BillingSequenceService sequenceService,
            SriEmitterResolver emitterResolver) {
        this.factuplanProperties = factuplanProperties;
        this.factuplanClient = factuplanClient;
        this.payloadBuilder = payloadBuilder;
        this.sequenceService = sequenceService;
        this.emitterResolver = emitterResolver;
    }

    @Override
    public boolean isEnabled() {
        return factuplanProperties.isEnabled() && factuplanProperties.isApiKeyConfigured();
    }

    @Override
    public String providerName() {
        return "factuplan";
    }

    @Override
    @Transactional
    public void emitInvoice(Invoice invoice) {
        SriEmitterContext emitter = emitterResolver.resolve(invoice.getUser());
        if (!isEnabled() || !emitter.hasRuc()) {
            invoice.setSriStatus("DISABLED");
            return;
        }

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.INVOICE);
        invoice.setSriSecuencial(secuencial);
        invoice.setSriDocumentNumber(SriDocumentNumber.format(
                emitter.establecimientoCodigo(),
                emitter.puntoEmision(),
                secuencial));

        try {
            JsonNode response = factuplanClient.createInvoice(
                    payloadBuilder.build(invoice, emitter),
                    emitter.ruc(),
                    "stockflow-inv-" + invoice.getId());

            SriDocumentFields.fromFactuplan(FactuplanClient.unwrapData(response), emitter)
                    .applyTo(invoice, emitter);

            if (invoice.getDatilInvoiceId() != null && shouldPoll(invoice.getSriStatus())) {
                pollUntilSettled(invoice, emitter);
            }
        } catch (ApiException ex) {
            invoice.setSriStatus("ERROR");
            invoice.setSriErrorMessage(truncateError(ex.getMessage()));
        }
    }

    @Override
    public void refreshFromProvider(Invoice invoice) {
        SriEmitterContext emitter = emitterResolver.resolve(invoice.getUser());
        if (invoice.getDatilInvoiceId() == null || invoice.getDatilInvoiceId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura no tiene ID del proveedor SRI");
        }
        JsonNode status = factuplanClient.getReceiptStatus(
                invoice.getDatilInvoiceId(), emitter.ruc());
        SriDocumentFields.fromFactuplan(FactuplanClient.unwrapData(status), emitter)
                .applyTo(invoice, emitter);
    }

    @Override
    public void reissueInvoice(Invoice invoice) {
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Reemisión de facturas con Factuplan estará disponible en la fase 12D");
    }

    private void pollUntilSettled(Invoice invoice, SriEmitterContext emitter) {
        for (int attempt = 0; attempt < 20; attempt++) {
            if (!shouldPoll(invoice.getSriStatus())) {
                return;
            }
            try {
                Thread.sleep(2000);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                return;
            }
            try {
                refreshFromProvider(invoice);
            } catch (ApiException ex) {
                invoice.setSriErrorMessage(ex.getMessage());
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

    private static String truncateError(String message) {
        if (message == null) return null;
        return message.length() > 1000 ? message.substring(0, 997) + "…" : message;
    }
}
