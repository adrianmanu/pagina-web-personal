package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.config.SriProviderProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.CreditNote;
import com.adrian.inventory.model.CreditNoteItem;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.service.sri.FactuplanSriDocumentsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class SriCreditNoteService {

    private static final DateTimeFormatter DATIL_DATE =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    private final DatilProperties properties;
    private final DatilClient datilClient;
    private final BillingSequenceService sequenceService;
    private final ObjectMapper objectMapper;
    private final SriProviderProperties providerProperties;
    private final FactuplanSriDocumentsService factuplanDocumentsService;

    public SriCreditNoteService(
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

    public void emitCreditNote(CreditNote creditNote) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.emitCreditNote(creditNote);
            return;
        }
        if (!properties.isConfigured()) {
            creditNote.setSriStatus("DISABLED");
            return;
        }

        Invoice invoice = creditNote.getInvoice();
        if (invoice.getSriDocumentNumber() == null || invoice.getSriDocumentNumber().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura origen no tiene número SRI");
        }

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.CREDIT_NOTE);
        creditNote.setSriSecuencial(secuencial);
        creditNote.setSriDocumentNumber(SriDocumentNumber.format(
                properties.getEstablecimientoCodigo(), properties.getPuntoEmision(), secuencial));

        submit(creditNote, secuencial, "stockflow-cn-" + creditNote.getId(), false);
    }

    public void refreshFromDatil(CreditNote creditNote) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.refreshCreditNote(creditNote);
            return;
        }
        if (creditNote.getDatilCreditNoteId() == null || creditNote.getDatilCreditNoteId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La nota de crédito no tiene ID de Datil");
        }
        JsonNode response = datilClient.get(SriDocumentType.CREDIT_NOTE, creditNote.getDatilCreditNoteId());
        SriDocumentFields.fromDatil(response, properties).applyTo(creditNote, properties);
    }

    private void submit(CreditNote creditNote, int secuencial, String idempotencyKey, boolean reissue) {
        ObjectNode payload = buildPayload(creditNote, secuencial);

        try {
            JsonNode response = reissue
                    ? datilClient.reissue(
                            SriDocumentType.CREDIT_NOTE, creditNote.getDatilCreditNoteId(), payload)
                    : datilClient.issue(SriDocumentType.CREDIT_NOTE, payload, idempotencyKey);

            SriDocumentFields.fromDatil(response, properties).applyTo(creditNote, properties);

            if (creditNote.getDatilCreditNoteId() != null && shouldRefresh(creditNote.getSriStatus())) {
                try {
                    refreshFromDatil(creditNote);
                } catch (ApiException refreshEx) {
                    creditNote.setSriErrorMessage(truncateError(refreshEx.getMessage()));
                }
            }
        } catch (ApiException ex) {
            creditNote.setSriStatus("ERROR");
            creditNote.setSriErrorMessage(truncateError(ex.getMessage()));
        }
    }

    private boolean shouldRefresh(String status) {
        return status == null
                || "ENVIADO".equalsIgnoreCase(status)
                || "RECIBIDO".equalsIgnoreCase(status)
                || "PENDIENTE".equalsIgnoreCase(status);
    }

    private ObjectNode buildPayload(CreditNote creditNote, int secuencial) {
        Invoice invoice = creditNote.getInvoice();
        TaxTotals taxTotals = calculateTaxTotals(creditNote);

        ObjectNode root = objectMapper.createObjectNode();
        root.put("ambiente", properties.getAmbiente());
        root.put("tipo_emision", 1);
        root.put("secuencial", secuencial);
        root.put("fecha_emision", DatilEmissionDates.format(properties, creditNote.getCreatedAt()));
        root.put("moneda", "USD");
        root.put("fecha_emision_documento_modificado", resolveModifiedDocumentDate(invoice));
        root.put("numero_documento_modificado", invoice.getSriDocumentNumber());
        root.put("tipo_documento_modificado", "01");
        root.put("motivo", creditNote.getMotivo());

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
            comprador.put(
                    "email",
                    blankTo(invoice.getCustomerEmail(), "cliente@stockflow.dev"));
            comprador.put(
                    "direccion",
                    blankTo(invoice.getCustomerAddress(), "N/D"));
        }

        ArrayNode items = root.putArray("items");
        for (CreditNoteItem item : creditNote.getItems()) {
            LineTax lineTax = calculateLineTax(item);
            ObjectNode line = items.addObject();
            line.put("cantidad", item.getQuantity());
            line.put("codigo_principal", blankTo(item.getSku(), "ITEM-" + item.getProductId()));
            line.put("descripcion", item.getProductName());
            line.put("precio_unitario", lineTax.unitPriceWithoutTax());
            line.put("precio_total_sin_impuestos", lineTax.subtotalWithoutTax());
            line.put("descuento", 0.0);
            ArrayNode impuestos = line.putArray("impuestos");
            ObjectNode impuesto = impuestos.addObject();
            impuesto.put("codigo", "2");
            impuesto.put("codigo_porcentaje", properties.getIvaCodigoPorcentaje());
            impuesto.put("tarifa", properties.getIvaRate());
            impuesto.put("base_imponible", lineTax.subtotalWithoutTax());
            impuesto.put("valor", lineTax.iva());
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

    private TaxTotals calculateTaxTotals(CreditNote creditNote) {
        double subtotal = 0;
        double iva = 0;
        for (CreditNoteItem item : creditNote.getItems()) {
            LineTax lineTax = calculateLineTax(item);
            subtotal += lineTax.subtotalWithoutTax();
            iva += lineTax.iva();
        }
        return new TaxTotals(round(subtotal), round(iva), round(subtotal + iva));
    }

    private LineTax calculateLineTax(CreditNoteItem item) {
        double quantity = item.getQuantity() == null ? 0 : item.getQuantity();
        double unitPrice = item.getUnitPrice() == null ? 0 : item.getUnitPrice();
        double lineTotal = round(quantity * unitPrice);

        if (properties.isPricesIncludeIva()) {
            double subtotalWithoutTax = round(lineTotal / (1 + properties.getIvaRate() / 100.0));
            double iva = round(lineTotal - subtotalWithoutTax);
            double unitWithoutTax = quantity > 0 ? round(subtotalWithoutTax / quantity) : 0;
            return new LineTax(unitWithoutTax, subtotalWithoutTax, iva);
        }

        double subtotalWithoutTax = lineTotal;
        double iva = round(subtotalWithoutTax * (properties.getIvaRate() / 100.0));
        return new LineTax(unitPrice, subtotalWithoutTax, iva);
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

    private record LineTax(double unitPriceWithoutTax, double subtotalWithoutTax, double iva) {}
}
