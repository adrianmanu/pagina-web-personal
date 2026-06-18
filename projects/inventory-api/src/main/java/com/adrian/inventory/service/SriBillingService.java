package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.BillingSequence;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.InvoiceItem;
import com.adrian.inventory.repository.BillingSequenceRepository;
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
public class SriBillingService {

    private static final DateTimeFormatter DATIL_DATE =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    private final DatilProperties properties;
    private final DatilClient datilClient;
    private final BillingSequenceRepository sequenceRepository;
    private final ObjectMapper objectMapper;

    public SriBillingService(
            DatilProperties properties,
            DatilClient datilClient,
            BillingSequenceRepository sequenceRepository,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.datilClient = datilClient;
        this.sequenceRepository = sequenceRepository;
        this.objectMapper = objectMapper;
    }

    public boolean isEnabled() {
        return properties.isConfigured();
    }

    @Transactional
    public void emitInvoice(Invoice invoice) {
        if (!properties.isConfigured()) {
            invoice.setSriStatus("DISABLED");
            return;
        }

        int secuencial = nextSecuencial();
        invoice.setSriSecuencial(secuencial);
        ObjectNode payload = buildPayload(invoice, secuencial);
        String idempotencyKey = "stockflow-inv-" + invoice.getId();

        try {
            JsonNode response = datilClient.issueInvoice(payload, idempotencyKey);
            applyDatilResponse(invoice, response);

            if (invoice.getDatilInvoiceId() != null && shouldRefresh(invoice.getSriStatus())) {
                try {
                    refreshFromDatil(invoice);
                } catch (ApiException refreshEx) {
                    invoice.setSriErrorMessage(refreshEx.getMessage());
                }
            }
        } catch (ApiException ex) {
            invoice.setSriStatus("ERROR");
            invoice.setSriErrorMessage(ex.getMessage());
            throw ex;
        }
    }

    public void refreshFromDatil(Invoice invoice) {
        if (invoice.getDatilInvoiceId() == null || invoice.getDatilInvoiceId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura no tiene ID de Datil");
        }
        JsonNode response = datilClient.getInvoice(invoice.getDatilInvoiceId());
        applyDatilResponse(invoice, response);
    }

    private void applyDatilResponse(Invoice invoice, JsonNode response) {
        if (response == null) {
            invoice.setSriStatus("ERROR");
            invoice.setSriErrorMessage("Respuesta vacía de Datil");
            return;
        }

        if (response.hasNonNull("id")) {
            invoice.setDatilInvoiceId(response.get("id").asText());
        }
        if (response.hasNonNull("clave_acceso")) {
            invoice.setSriAccessKey(response.get("clave_acceso").asText());
        }
        if (response.hasNonNull("estado")) {
            invoice.setSriStatus(response.get("estado").asText());
        } else {
            invoice.setSriStatus("ENVIADO");
        }

        JsonNode autorizacion = response.path("autorizacion");
        if (autorizacion.hasNonNull("numero")) {
            invoice.setSriAuthorizationNumber(autorizacion.get("numero").asText());
        } else if (response.path("autorizacion_sri").hasNonNull("numero_autorizacion")) {
            invoice.setSriAuthorizationNumber(response.path("autorizacion_sri").get("numero_autorizacion").asText());
        }

        if ("AUTORIZADO".equalsIgnoreCase(invoice.getSriStatus())) {
            invoice.setSriErrorMessage(null);
        } else if (response.has("mensajes") && response.get("mensajes").isArray() && !response.get("mensajes").isEmpty()) {
            invoice.setSriErrorMessage(response.get("mensajes").get(0).asText());
        }
    }

    private boolean shouldRefresh(String status) {
        return status == null
                || "ENVIADO".equalsIgnoreCase(status)
                || "RECIBIDO".equalsIgnoreCase(status)
                || "PENDIENTE".equalsIgnoreCase(status);
    }

    @Transactional
    protected int nextSecuencial() {
        BillingSequence sequence = sequenceRepository
                .findByScopeKey("default")
                .orElseGet(() -> {
                    BillingSequence created = new BillingSequence();
                    created.setScopeKey("default");
                    created.setLastSecuencial(Math.max(0, properties.getSecuencialInicial()));
                    return sequenceRepository.save(created);
                });
        int next = sequence.getLastSecuencial() + 1;
        if (next > 999_999_999) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Secuencial de facturación agotado");
        }
        sequence.setLastSecuencial(next);
        sequenceRepository.save(sequence);
        return next;
    }

    private ObjectNode buildPayload(Invoice invoice, int secuencial) {
        TaxTotals taxTotals = calculateTaxTotals(invoice);

        ObjectNode root = objectMapper.createObjectNode();
        root.put("ambiente", properties.getAmbiente());
        root.put("tipo_emision", 1);
        root.put("secuencial", secuencial);
        root.put("fecha_emision", DATIL_DATE.format(invoice.getCreatedAt().atZone(ZoneOffset.systemDefault())));
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
            comprador.put("identificacion", normalizeTaxId(invoice.getCustomerTaxId()));
            comprador.put("tipo_identificacion", resolveIdType(invoice.getCustomerTaxId()));
            if (invoice.getCustomerEmail() != null) {
                comprador.put("email", invoice.getCustomerEmail());
            }
            if (invoice.getCustomerAddress() != null) {
                comprador.put("direccion", invoice.getCustomerAddress());
            }
        }

        ArrayNode items = root.putArray("items");
        for (InvoiceItem item : invoice.getItems()) {
            LineTax lineTax = calculateLineTax(item);
            ObjectNode line = items.addObject();
            line.put("cantidad", item.getQuantity());
            line.put("codigo_principal", blankTo(item.getSku(), "ITEM-" + item.getProductId()));
            line.put("descripcion", item.getProductName());
            line.put("precio_unitario", lineTax.unitPriceWithoutTax());
            line.put("precio_total_sin_impuestos", lineTax.subtotalWithoutTax());
            line.put("descuento", 0.0);
            line.put("unidad_medida", "unidad");
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

    private TaxTotals calculateTaxTotals(Invoice invoice) {
        double subtotal = 0;
        double iva = 0;
        for (InvoiceItem item : invoice.getItems()) {
            LineTax lineTax = calculateLineTax(item);
            subtotal += lineTax.subtotalWithoutTax();
            iva += lineTax.iva();
        }
        double total = round(subtotal + iva);
        return new TaxTotals(round(subtotal), round(iva), total);
    }

    private LineTax calculateLineTax(InvoiceItem item) {
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

    private static String resolveIdType(String taxId) {
        String normalized = normalizeTaxId(taxId);
        if (normalized.length() == 13) return "04";
        if (normalized.length() == 10) return "05";
        return "04";
    }

    private static String normalizeTaxId(String taxId) {
        if (taxId == null) return "";
        return taxId.replaceAll("\\D", "");
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
