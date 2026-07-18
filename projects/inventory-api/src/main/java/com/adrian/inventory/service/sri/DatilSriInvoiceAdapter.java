package com.adrian.inventory.service.sri;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class DatilSriInvoiceAdapter implements SriInvoicePort {

    private final DatilProperties properties;
    private final DatilClient datilClient;
    private final BillingSequenceService sequenceService;
    private final ObjectMapper objectMapper;

    public DatilSriInvoiceAdapter(
            DatilProperties properties,
            DatilClient datilClient,
            BillingSequenceService sequenceService,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.datilClient = datilClient;
        this.sequenceService = sequenceService;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean isEnabled() {
        return properties.isConfigured();
    }

    @Override
    public String providerName() {
        return "datil";
    }

    @Override
    @Transactional
    public void emitInvoice(Invoice invoice) {
        if (!properties.isConfigured()) {
            invoice.setSriStatus("DISABLED");
            return;
        }

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.INVOICE);
        invoice.setSriSecuencial(secuencial);
        invoice.setSriDocumentNumber(SriDocumentNumber.format(
                properties.getEstablecimientoCodigo(), properties.getPuntoEmision(), secuencial));

        submitInvoice(invoice, secuencial, "stockflow-inv-" + invoice.getId(), false);
    }

    @Override
    public void refreshFromProvider(Invoice invoice) {
        if (invoice.getDatilInvoiceId() == null || invoice.getDatilInvoiceId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura no tiene ID del proveedor SRI");
        }
        JsonNode response = datilClient.get(SriDocumentType.INVOICE, invoice.getDatilInvoiceId());
        SriDocumentFields.fromDatil(response, properties).applyTo(invoice, properties);
    }

    @Override
    @Transactional
    public void reissueInvoice(Invoice invoice) {
        if (!properties.isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        if (invoice.getDatilInvoiceId() == null || invoice.getDatilInvoiceId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura no tiene ID de Datil para reemitir");
        }
        if (invoice.getSriSecuencial() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura no tiene secuencial SRI");
        }
        if (!SriBillingService.canReissue(invoice.getSriStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se puede reemitir facturas con estado ERROR, NO AUTORIZADO o DEVUELTO");
        }

        submitInvoice(
                invoice,
                invoice.getSriSecuencial(),
                "stockflow-inv-reissue-" + invoice.getId(),
                true);
    }

    private void submitInvoice(Invoice invoice, int secuencial, String idempotencyKey, boolean reissue) {
        ObjectNode payload = buildPayload(invoice, secuencial);

        try {
            JsonNode response = reissue
                    ? datilClient.reissue(SriDocumentType.INVOICE, invoice.getDatilInvoiceId(), payload)
                    : datilClient.issue(SriDocumentType.INVOICE, payload, idempotencyKey);

            SriDocumentFields.fromDatil(response, properties).applyTo(invoice, properties);

            if (invoice.getDatilInvoiceId() != null && shouldRefresh(invoice.getSriStatus())) {
                try {
                    refreshFromProvider(invoice);
                } catch (ApiException refreshEx) {
                    invoice.setSriErrorMessage(refreshEx.getMessage());
                }
            }
        } catch (ApiException ex) {
            invoice.setSriStatus("ERROR");
            invoice.setSriErrorMessage(truncateError(ex.getMessage()));
        }
    }

    private boolean shouldRefresh(String status) {
        return status == null
                || "ENVIADO".equalsIgnoreCase(status)
                || "RECIBIDO".equalsIgnoreCase(status)
                || "PENDIENTE".equalsIgnoreCase(status);
    }

    private ObjectNode buildPayload(Invoice invoice, int secuencial) {
        TaxTotals taxTotals = calculateTaxTotals(invoice);

        ObjectNode root = objectMapper.createObjectNode();
        root.put("ambiente", properties.getAmbiente());
        root.put("tipo_emision", 1);
        root.put("secuencial", secuencial);
        root.put("fecha_emision", DatilEmissionDates.format(properties, invoice.getCreatedAt()));
        root.put("moneda", "USD");

        ObjectNode emisor = root.putObject("emisor");
        emisor.put("ruc", properties.getRuc());
        emisor.put("razon_social", properties.getRazonSocial());
        emisor.put("nombre_comercial", blankTo(properties.getNombreComercial(), properties.getRazonSocial()));
        emisor.put("direccion", properties.getDireccion());
        emisor.put("obligado_contabilidad", properties.isObligadoContabilidad());
        if (properties.getContribuyenteEspecial() != null && !properties.getContribuyenteEspecial().isBlank()) {
            emisor.put("contribuyente_especial", properties.getContribuyenteEspecial());
        }
        ObjectNode establecimiento = emisor.putObject("establecimiento");
        establecimiento.put("codigo", properties.getEstablecimientoCodigo());
        establecimiento.put("punto_emision", properties.getPuntoEmision());
        establecimiento.put(
                "direccion",
                blankTo(properties.getEstablecimientoDireccion(), properties.getDireccion()));

        ObjectNode totales = root.putObject("totales");
        totales.put("total_sin_impuestos", taxTotals.subtotal());
        totales.put("descuento", 0.0);
        totales.put("propina", 0.0);
        totales.put("importe_total", taxTotals.total());
        var impuestosTotales = totales.putArray("impuestos");
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
            if (invoice.getCustomerEmail() != null) {
                comprador.put("email", invoice.getCustomerEmail());
            }
            if (invoice.getCustomerAddress() != null) {
                comprador.put("direccion", invoice.getCustomerAddress());
            }
        }

        var items = root.putArray("items");
        for (var item : invoice.getItems()) {
            LineTax lineTax = calculateLineTax(item);
            ObjectNode line = items.addObject();
            line.put("cantidad", item.getQuantity());
            line.put("codigo_principal", blankTo(item.getSku(), "ITEM-" + item.getProductId()));
            line.put("descripcion", item.getProductName());
            line.put("precio_unitario", lineTax.unitPriceWithoutTax());
            line.put("precio_total_sin_impuestos", lineTax.subtotalWithoutTax());
            line.put("descuento", 0.0);
            line.put("unidad_medida", "unidad");
            var impuestos = line.putArray("impuestos");
            ObjectNode impuesto = impuestos.addObject();
            impuesto.put("codigo", "2");
            impuesto.put("codigo_porcentaje", properties.getIvaCodigoPorcentaje());
            impuesto.put("tarifa", properties.getIvaRate());
            impuesto.put("base_imponible", lineTax.subtotalWithoutTax());
            impuesto.put("valor", lineTax.iva());
        }

        return root;
    }

    private TaxTotals calculateTaxTotals(Invoice invoice) {
        double subtotal = 0;
        double iva = 0;
        for (var item : invoice.getItems()) {
            LineTax lineTax = calculateLineTax(item);
            subtotal += lineTax.subtotalWithoutTax();
            iva += lineTax.iva();
        }
        double total = round(subtotal + iva);
        return new TaxTotals(round(subtotal), round(iva), total);
    }

    private LineTax calculateLineTax(com.adrian.inventory.model.InvoiceItem item) {
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
