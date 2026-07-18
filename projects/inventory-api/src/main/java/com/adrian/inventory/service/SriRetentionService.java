package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.config.SriProviderProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Retention;
import com.adrian.inventory.model.RetentionItem;
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
public class SriRetentionService {

    private static final ZoneOffset ECUADOR_OFFSET = ZoneOffset.of("-05:00");

    private final DatilProperties properties;
    private final DatilClient datilClient;
    private final BillingSequenceService sequenceService;
    private final ObjectMapper objectMapper;
    private final SriProviderProperties providerProperties;
    private final FactuplanSriDocumentsService factuplanDocumentsService;

    public SriRetentionService(
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
            return factuplanDocumentsService.isEnabled() && properties.isAgenteRetencion();
        }
        return properties.isConfigured() && properties.isAgenteRetencion();
    }

    public void emitRetention(Retention retention) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.emitRetention(retention);
            return;
        }
        if (!properties.isConfigured()) {
            retention.setSriStatus("DISABLED");
            return;
        }
        if (!properties.isAgenteRetencion()) {
            retention.setSriStatus("DISABLED");
            retention.setSriErrorMessage("El emisor no está configurado como agente de retención");
            return;
        }

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.RETENTION);
        retention.setSriSecuencial(secuencial);
        retention.setSriDocumentNumber(SriDocumentNumber.format(
                properties.getEstablecimientoCodigo(), properties.getPuntoEmision(), secuencial));

        submit(retention, secuencial, "stockflow-ret-" + retention.getId(), false);
    }

    @Transactional
    public void reissueRetention(Retention retention) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.reissueRetention(retention);
            return;
        }
        if (!properties.isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        if (retention.getDatilRetentionId() == null || retention.getDatilRetentionId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La retención no tiene ID de Datil para reemitir");
        }
        if (retention.getSriSecuencial() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La retención no tiene secuencial SRI");
        }
        if (!SriBillingService.canReissue(retention.getSriStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se puede reemitir retenciones con estado ERROR, NO AUTORIZADO o DEVUELTO");
        }

        submit(retention, retention.getSriSecuencial(), "stockflow-ret-reissue-" + retention.getId(), true);
    }

    public void refreshFromDatil(Retention retention) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.refreshRetention(retention);
            return;
        }
        if (retention.getDatilRetentionId() == null || retention.getDatilRetentionId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La retención no tiene ID de Datil");
        }
        JsonNode response = datilClient.get(SriDocumentType.RETENTION, retention.getDatilRetentionId());
        SriDocumentFields.fromDatil(response, properties).applyTo(retention, properties);
    }

    private void submit(Retention retention, int secuencial, String idempotencyKey, boolean reissue) {
        ObjectNode payload = buildPayload(retention, secuencial);

        try {
            JsonNode response = reissue
                    ? datilClient.reissue(SriDocumentType.RETENTION, retention.getDatilRetentionId(), payload)
                    : datilClient.issue(SriDocumentType.RETENTION, payload, idempotencyKey);

            SriDocumentFields.fromDatil(response, properties).applyTo(retention, properties);

            if (retention.getDatilRetentionId() != null && shouldRefresh(retention.getSriStatus())) {
                try {
                    refreshFromDatil(retention);
                } catch (ApiException refreshEx) {
                    retention.setSriErrorMessage(truncateError(refreshEx.getMessage()));
                }
            }
        } catch (ApiException ex) {
            retention.setSriStatus("ERROR");
            retention.setSriErrorMessage(truncateError(ex.getMessage()));
        }
    }

    private boolean shouldRefresh(String status) {
        return status == null
                || "ENVIADO".equalsIgnoreCase(status)
                || "RECIBIDO".equalsIgnoreCase(status)
                || "PENDIENTE".equalsIgnoreCase(status);
    }

    private ObjectNode buildPayload(Retention retention, int secuencial) {
        Supplier supplier = retention.getSupplier();

        ObjectNode root = objectMapper.createObjectNode();
        root.put("ambiente", properties.getAmbiente());
        root.put("tipo_emision", 1);
        root.put("secuencial", secuencial);
        root.put("fecha_emision", DatilEmissionDates.format(properties, retention.getCreatedAt()));
        root.put("periodo_fiscal", retention.getPeriodoFiscal());

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

        ObjectNode sujeto = root.putObject("sujeto");
        sujeto.put("razon_social", supplier.getName());
        sujeto.put("identificacion", TaxIdValidator.normalize(supplier.getTaxId()));
        sujeto.put("tipo_identificacion", TaxIdValidator.resolveIdType(supplier.getTaxId()));
        sujeto.put("email", blankTo(supplier.getEmail(), "proveedor@stockflow.dev"));
        sujeto.put("direccion", blankTo(supplier.getAddress(), "Quito"));
        if (supplier.getPhone() != null && !supplier.getPhone().isBlank()) {
            sujeto.put("telefono", supplier.getPhone().trim());
        }

        ArrayNode items = root.putArray("items");
        String supportDocDate = formatSupportDocumentDate(retention);
        for (RetentionItem item : retention.getItems()) {
            double base = round(item.getTaxableBase());
            double percentage = item.getPercentage();
            double retained = round(base * percentage / 100.0);

            ObjectNode line = items.addObject();
            line.put("codigo", item.getTaxType());
            line.put("codigo_porcentaje", item.getRetentionCode());
            line.put("base_imponible", base);
            line.put("porcentaje", percentage);
            line.put("valor_retenido", retained);
            line.put("numero_documento_sustento", retention.getSupportDocumentNumber());
            line.put("tipo_documento_sustento", retention.getSupportDocumentType());
            line.put("fecha_emision_documento_sustento", supportDocDate);
        }

        return root;
    }

    private String formatSupportDocumentDate(Retention retention) {
        return retention.getSupportDocumentDate()
                .atStartOfDay()
                .atOffset(ECUADOR_OFFSET)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    private static String truncateError(String message) {
        if (message == null) return null;
        return message.length() > 1000 ? message.substring(0, 997) + "…" : message;
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    static double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
