package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.config.SriProviderProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.PurchaseSettlement;
import com.adrian.inventory.model.PurchaseSettlementItem;
import com.adrian.inventory.model.Supplier;
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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class SriPurchaseSettlementService {

    private static final String ZERO_IVA_CODE = "0";
    private static final ZoneOffset ECUADOR_OFFSET = ZoneOffset.of("-05:00");
    private static final DateTimeFormatter DATIL_DATE =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    private final DatilProperties properties;
    private final DatilClient datilClient;
    private final BillingSequenceService sequenceService;
    private final ObjectMapper objectMapper;
    private final SriProviderProperties providerProperties;
    private final FactuplanSriDocumentsService factuplanDocumentsService;

    public SriPurchaseSettlementService(
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
            return false;
        }
        return properties.isConfigured();
    }

    public void emitPurchaseSettlement(PurchaseSettlement settlement) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.emitPurchaseSettlement(settlement);
            return;
        }
        if (!properties.isConfigured()) {
            settlement.setSriStatus("DISABLED");
            return;
        }

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.PURCHASE_SETTLEMENT);
        settlement.setSriSecuencial(secuencial);
        settlement.setSriDocumentNumber(SriDocumentNumber.format(
                properties.getEstablecimientoCodigo(), properties.getPuntoEmision(), secuencial));

        submit(settlement, secuencial, "stockflow-ps-" + settlement.getId(), false);
    }

    @Transactional
    public void reissuePurchaseSettlement(PurchaseSettlement settlement) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.reissuePurchaseSettlement(settlement);
            return;
        }
        if (!properties.isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        if (settlement.getDatilPurchaseSettlementId() == null
                || settlement.getDatilPurchaseSettlementId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La liquidación no tiene ID de Datil para reemitir");
        }
        if (settlement.getSriSecuencial() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La liquidación no tiene secuencial SRI");
        }
        if (!SriBillingService.canReissue(settlement.getSriStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se puede reemitir liquidaciones con estado ERROR, NO AUTORIZADO o DEVUELTO");
        }

        submit(
                settlement,
                settlement.getSriSecuencial(),
                "stockflow-ps-reissue-" + settlement.getId(),
                true);
    }

    public void refreshFromDatil(PurchaseSettlement settlement) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.refreshPurchaseSettlement(settlement);
            return;
        }
        if (settlement.getDatilPurchaseSettlementId() == null
                || settlement.getDatilPurchaseSettlementId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La liquidación no tiene ID de Datil");
        }
        JsonNode response =
                datilClient.get(SriDocumentType.PURCHASE_SETTLEMENT, settlement.getDatilPurchaseSettlementId());
        SriDocumentFields.fromDatil(response, properties).applyTo(settlement, properties);
    }

    private void submit(PurchaseSettlement settlement, int secuencial, String idempotencyKey, boolean reissue) {
        ObjectNode payload = buildPayload(settlement, secuencial);

        try {
            JsonNode response = reissue
                    ? datilClient.reissue(
                            SriDocumentType.PURCHASE_SETTLEMENT,
                            settlement.getDatilPurchaseSettlementId(),
                            payload)
                    : datilClient.issue(SriDocumentType.PURCHASE_SETTLEMENT, payload, idempotencyKey);

            SriDocumentFields.fromDatil(response, properties).applyTo(settlement, properties);

            if (settlement.getDatilPurchaseSettlementId() != null && shouldRefresh(settlement.getSriStatus())) {
                try {
                    refreshFromDatil(settlement);
                } catch (ApiException refreshEx) {
                    settlement.setSriErrorMessage(truncateError(refreshEx.getMessage()));
                }
            }
        } catch (ApiException ex) {
            settlement.setSriStatus("ERROR");
            settlement.setSriErrorMessage(truncateError(ex.getMessage()));
        }
    }

    private boolean shouldRefresh(String status) {
        return status == null
                || "ENVIADO".equalsIgnoreCase(status)
                || "RECIBIDO".equalsIgnoreCase(status)
                || "PENDIENTE".equalsIgnoreCase(status);
    }

    private ObjectNode buildPayload(PurchaseSettlement settlement, int secuencial) {
        double subtotal = calculateSubtotal(settlement);
        Supplier supplier = settlement.getSupplier();

        ObjectNode root = objectMapper.createObjectNode();
        root.put("ambiente", properties.getAmbiente());
        root.put("tipo_emision", 1);
        root.put("secuencial", secuencial);
        root.put("fecha_emision", emissionDate());
        root.put("moneda", "USD");

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
        totales.put("total_sin_impuestos", subtotal);
        totales.put("importe_total", subtotal);
        totales.put("descuento", 0.0);
        ArrayNode impuestosTotales = totales.putArray("impuestos");
        ObjectNode impuestoTotal = impuestosTotales.addObject();
        impuestoTotal.put("codigo", "2");
        impuestoTotal.put("codigo_porcentaje", ZERO_IVA_CODE);
        impuestoTotal.put("base_imponible", subtotal);
        impuestoTotal.put("valor", 0.0);

        ObjectNode proveedor = root.putObject("proveedor");
        proveedor.put("razon_social", supplier.getName());
        proveedor.put("identificacion", TaxIdValidator.normalize(supplier.getTaxId()));
        proveedor.put("tipo_identificacion", TaxIdValidator.resolveIdType(supplier.getTaxId()));
        proveedor.put("email", blankTo(supplier.getEmail(), "proveedor@stockflow.dev"));
        proveedor.put("direccion", blankTo(supplier.getAddress(), "Quito"));
        if (supplier.getPhone() != null && !supplier.getPhone().isBlank()) {
            proveedor.put("telefono", supplier.getPhone().trim());
        }

        ArrayNode items = root.putArray("items");
        for (PurchaseSettlementItem item : settlement.getItems()) {
            double lineSubtotal = item.getSubtotal() == null ? 0 : item.getSubtotal();
            ObjectNode line = items.addObject();
            line.put("cantidad", item.getQuantity());
            line.put("codigo_principal", blankTo(item.getSku(), "ITEM-" + item.getProductId()));
            line.put("descripcion", item.getDescription());
            line.put("precio_unitario", item.getUnitPrice());
            line.put("precio_total_sin_impuestos", lineSubtotal);
            line.put("descuento", 0.0);
            ArrayNode impuestos = line.putArray("impuestos");
            ObjectNode impuesto = impuestos.addObject();
            impuesto.put("codigo", "2");
            impuesto.put("codigo_porcentaje", ZERO_IVA_CODE);
            impuesto.put("tarifa", 0.0);
            impuesto.put("base_imponible", lineSubtotal);
            impuesto.put("valor", 0.0);
        }

        ArrayNode pagos = root.putArray("pagos");
        ObjectNode pago = pagos.addObject();
        pago.put("forma_pago", "01");
        pago.put("total", subtotal);
        pago.put("unidad_tiempo", "dias");
        pago.put("plazo", "0");

        return root;
    }

    private String emissionDate() {
        return OffsetDateTime.now(ECUADOR_OFFSET).minusMinutes(1).format(DATIL_DATE);
    }

    private double calculateSubtotal(PurchaseSettlement settlement) {
        double subtotal = 0;
        for (PurchaseSettlementItem item : settlement.getItems()) {
            subtotal += item.getSubtotal() == null ? 0 : item.getSubtotal();
        }
        return round(subtotal);
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
}
