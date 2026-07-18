package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.config.SriProviderProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.DebitNote;
import com.adrian.inventory.model.DebitNoteItem;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.service.sri.FactuplanSriDocumentsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class SriDebitNoteService {

    private static final DateTimeFormatter DATIL_DATE =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    private final DatilProperties properties;
    private final DatilClient datilClient;
    private final BillingSequenceService sequenceService;
    private final ObjectMapper objectMapper;
    private final SriProviderProperties providerProperties;
    private final FactuplanSriDocumentsService factuplanDocumentsService;

    public SriDebitNoteService(
            DatilProperties properties,
            DatilClient datilClient,
            BillingSequenceService sequenceService,
            ObjectMapper objectMapper,
            SriProviderProperties providerProperties,
            FactuplanSriDocumentsService factuplanDocumentsService) {
        this.properties = properties;
        this.datilClient = datilClient;
        this.sequenceService = sequenceService;
        this.objectMapper = objectMapper;
        this.providerProperties = providerProperties;
        this.factuplanDocumentsService = factuplanDocumentsService;
    }

    public boolean isEnabled() {
        if (providerProperties.isFactuplan()) {
            return factuplanDocumentsService.isEnabled();
        }
        return properties.isConfigured();
    }

    public void emitDebitNote(DebitNote debitNote) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.emitDebitNote(debitNote);
            return;
        }
        if (!properties.isConfigured()) {
            debitNote.setSriStatus("DISABLED");
            return;
        }

        Invoice invoice = debitNote.getInvoice();
        if (invoice.getSriDocumentNumber() == null || invoice.getSriDocumentNumber().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura origen no tiene número SRI");
        }

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.DEBIT_NOTE);
        debitNote.setSriSecuencial(secuencial);
        debitNote.setSriDocumentNumber(SriDocumentNumber.format(
                properties.getEstablecimientoCodigo(), properties.getPuntoEmision(), secuencial));

        submit(debitNote, secuencial, "stockflow-dn-" + debitNote.getId(), false);
    }

    @Transactional
    public void reissueDebitNote(DebitNote debitNote) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.reissueDebitNote(debitNote);
            return;
        }
        if (!properties.isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        if (debitNote.getDatilDebitNoteId() == null || debitNote.getDatilDebitNoteId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La nota de débito no tiene ID de Datil para reemitir");
        }
        if (debitNote.getSriSecuencial() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La nota de débito no tiene secuencial SRI");
        }
        if (!SriBillingService.canReissue(debitNote.getSriStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se puede reemitir notas de débito con estado ERROR, NO AUTORIZADO o DEVUELTO");
        }

        submit(
                debitNote,
                debitNote.getSriSecuencial(),
                "stockflow-dn-reissue-" + debitNote.getId(),
                true);
    }

    public void refreshFromDatil(DebitNote debitNote) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.refreshDebitNote(debitNote);
            return;
        }
        if (debitNote.getDatilDebitNoteId() == null || debitNote.getDatilDebitNoteId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La nota de débito no tiene ID de Datil");
        }
        JsonNode response = datilClient.get(SriDocumentType.DEBIT_NOTE, debitNote.getDatilDebitNoteId());
        SriDocumentFields.fromDatil(response, properties).applyTo(debitNote, properties);
    }

    private void submit(DebitNote debitNote, int secuencial, String idempotencyKey, boolean reissue) {
        ObjectNode payload = buildPayload(debitNote, secuencial);

        try {
            JsonNode response = reissue
                    ? datilClient.reissue(
                            SriDocumentType.DEBIT_NOTE, debitNote.getDatilDebitNoteId(), payload)
                    : datilClient.issue(SriDocumentType.DEBIT_NOTE, payload, idempotencyKey);

            SriDocumentFields.fromDatil(response, properties).applyTo(debitNote, properties);

            if (debitNote.getDatilDebitNoteId() != null && shouldRefresh(debitNote.getSriStatus())) {
                try {
                    refreshFromDatil(debitNote);
                } catch (ApiException refreshEx) {
                    debitNote.setSriErrorMessage(truncateError(refreshEx.getMessage()));
                }
            }
        } catch (ApiException ex) {
            debitNote.setSriStatus("ERROR");
            debitNote.setSriErrorMessage(truncateError(ex.getMessage()));
        }
    }

    private boolean shouldRefresh(String status) {
        return status == null
                || "ENVIADO".equalsIgnoreCase(status)
                || "RECIBIDO".equalsIgnoreCase(status)
                || "PENDIENTE".equalsIgnoreCase(status);
    }

    private ObjectNode buildPayload(DebitNote debitNote, int secuencial) {
        Invoice invoice = debitNote.getInvoice();
        TaxTotals taxTotals = calculateTaxTotals(debitNote);

        ObjectNode root = objectMapper.createObjectNode();
        root.put("ambiente", properties.getAmbiente());
        root.put("tipo_emision", 1);
        root.put("secuencial", secuencial);
        root.put("fecha_emision", DATIL_DATE.format(debitNote.getCreatedAt().atZone(ZoneOffset.systemDefault())));
        root.put("fecha_emision_documento_modificado", resolveModifiedDocumentDate(invoice));
        root.put("numero_documento_modificado", invoice.getSriDocumentNumber());
        root.put("tipo_documento_modificado", "01");

        ObjectNode emisor = root.putObject("emisor");
        emisor.put("ruc", properties.getRuc());
        emisor.put("razon_social", properties.getRazonSocial());
        emisor.put("nombre_comercial", blankTo(properties.getNombreComercial(), properties.getRazonSocial()));
        emisor.put("direccion", properties.getDireccion());
        emisor.put("obligado_contabilidad", properties.isObligadoContabilidad());
        emisor.put("contribuyente_especial", blankTo(properties.getContribuyenteEspecial(), ""));
        ObjectNode establecimiento = emisor.putObject("establecimiento");
        establecimiento.put("codigo", properties.getEstablecimientoCodigo());
        establecimiento.put("punto_emision", properties.getPuntoEmision());
        establecimiento.put(
                "direccion",
                blankTo(properties.getEstablecimientoDireccion(), properties.getDireccion()));

        ObjectNode totales = root.putObject("totales");
        totales.put("total_sin_impuestos", taxTotals.subtotal());
        totales.put("importe_total", taxTotals.total());
        ArrayNode impuestosTotales = totales.putArray("impuestos");
        ObjectNode impuestoTotal = impuestosTotales.addObject();
        impuestoTotal.put("codigo", "2");
        impuestoTotal.put("codigo_porcentaje", properties.getIvaCodigoPorcentaje());
        impuestoTotal.put("base_imponible", taxTotals.subtotal());
        impuestoTotal.put("valor", taxTotals.iva());
        impuestoTotal.put("tarifa", properties.getIvaRate());

        ObjectNode comprador = root.putObject("comprador");
        if (invoice.isFinalConsumer()) {
            comprador.put("razon_social", "CONSUMIDOR FINAL");
            comprador.put("identificacion", "9999999999999");
            comprador.put("tipo_identificacion", "07");
            comprador.put("email", "consumidorfinal@facturacion.ec");
            comprador.put("direccion", "N/D");
        } else {
            comprador.put("razon_social", invoice.getCustomerName());
            comprador.put("identificacion", TaxIdValidator.normalize(invoice.getCustomerTaxId()));
            comprador.put("tipo_identificacion", TaxIdValidator.resolveIdType(invoice.getCustomerTaxId()));
            comprador.put("email", blankTo(invoice.getCustomerEmail(), "cliente@stockflow.dev"));
            comprador.put("direccion", blankTo(invoice.getCustomerAddress(), "N/D"));
        }

        ArrayNode items = root.putArray("items");
        for (DebitNoteItem item : debitNote.getItems()) {
            LineTax lineTax = calculateLineTax(item);
            ObjectNode line = items.addObject();
            line.put("motivo", item.getMotivo());
            line.put("valor", lineTax.subtotalWithoutTax());
        }

        return root;
    }

    private String resolveModifiedDocumentDate(Invoice invoice) {
        if (invoice.getDatilInvoiceId() != null && !invoice.getDatilInvoiceId().isBlank()) {
            try {
                JsonNode datilInvoice = datilClient.get(SriDocumentType.INVOICE, invoice.getDatilInvoiceId());
                if (datilInvoice.hasNonNull("fecha_emision")) {
                    String fecha = datilInvoice.get("fecha_emision").asText();
                    if (fecha.length() == 10) {
                        return fecha + "T00:00:00.000Z";
                    }
                    return fecha;
                }
            } catch (ApiException ignored) {
                // fallback to local timestamp
            }
        }
        return DATIL_DATE.format(invoice.getCreatedAt().atZone(ZoneOffset.systemDefault()));
    }

    private TaxTotals calculateTaxTotals(DebitNote debitNote) {
        double subtotal = 0;
        double iva = 0;
        for (DebitNoteItem item : debitNote.getItems()) {
            LineTax lineTax = calculateLineTax(item);
            subtotal += lineTax.subtotalWithoutTax();
            iva += lineTax.iva();
        }
        return new TaxTotals(round(subtotal), round(iva), round(subtotal + iva));
    }

    private LineTax calculateLineTax(DebitNoteItem item) {
        double amount = item.getAmount() == null ? 0 : item.getAmount();

        if (properties.isPricesIncludeIva()) {
            double subtotalWithoutTax = round(amount / (1 + properties.getIvaRate() / 100.0));
            double iva = round(amount - subtotalWithoutTax);
            return new LineTax(subtotalWithoutTax, iva);
        }

        double subtotalWithoutTax = round(amount);
        double iva = round(subtotalWithoutTax * (properties.getIvaRate() / 100.0));
        return new LineTax(subtotalWithoutTax, iva);
    }

    private static String truncateError(String message) {
        if (message == null) return null;
        return message.length() > 1000 ? message.substring(0, 997) + "…" : message;
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private record TaxTotals(double subtotal, double iva, double total) {}

    private record LineTax(double subtotalWithoutTax, double iva) {}
}
