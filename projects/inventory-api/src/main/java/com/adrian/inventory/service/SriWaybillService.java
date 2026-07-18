package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.config.SriProviderProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.Waybill;
import com.adrian.inventory.model.WaybillItem;
import com.adrian.inventory.service.sri.FactuplanSriDocumentsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class SriWaybillService {

    private static final DateTimeFormatter DATIL_DATE =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    private final DatilProperties properties;
    private final DatilClient datilClient;
    private final BillingSequenceService sequenceService;
    private final ObjectMapper objectMapper;
    private final SriProviderProperties providerProperties;
    private final FactuplanSriDocumentsService factuplanDocumentsService;

    public SriWaybillService(
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

    public void emitWaybill(Waybill waybill) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.emitWaybill(waybill);
            return;
        }
        if (!properties.isConfigured()) {
            waybill.setSriStatus("DISABLED");
            return;
        }

        int secuencial = sequenceService.nextSecuencial(SriDocumentType.WAYBILL);
        waybill.setSriSecuencial(secuencial);
        waybill.setSriDocumentNumber(SriDocumentNumber.format(
                properties.getEstablecimientoCodigo(), properties.getPuntoEmision(), secuencial));

        submit(waybill, secuencial, "stockflow-wb-" + waybill.getId(), false);
    }

    @Transactional
    public void reissueWaybill(Waybill waybill) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.reissueWaybill(waybill);
            return;
        }
        if (!properties.isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        if (waybill.getDatilWaybillId() == null || waybill.getDatilWaybillId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La guía no tiene ID de Datil para reemitir");
        }
        if (waybill.getSriSecuencial() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La guía no tiene secuencial SRI");
        }
        if (!SriBillingService.canReissue(waybill.getSriStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se puede reemitir guías con estado ERROR, NO AUTORIZADO o DEVUELTO");
        }

        submit(waybill, waybill.getSriSecuencial(), "stockflow-wb-reissue-" + waybill.getId(), true);
    }

    public void refreshFromDatil(Waybill waybill) {
        if (providerProperties.isFactuplan()) {
            factuplanDocumentsService.refreshWaybill(waybill);
            return;
        }
        if (waybill.getDatilWaybillId() == null || waybill.getDatilWaybillId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La guía no tiene ID de Datil");
        }
        JsonNode response = datilClient.get(SriDocumentType.WAYBILL, waybill.getDatilWaybillId());
        SriDocumentFields.fromDatil(response, properties).applyTo(waybill, properties);
    }

    private void submit(Waybill waybill, int secuencial, String idempotencyKey, boolean reissue) {
        ObjectNode payload = buildPayload(waybill, secuencial);

        try {
            JsonNode response = reissue
                    ? datilClient.reissue(SriDocumentType.WAYBILL, waybill.getDatilWaybillId(), payload)
                    : datilClient.issue(SriDocumentType.WAYBILL, payload, idempotencyKey);

            SriDocumentFields.fromDatil(response, properties).applyTo(waybill, properties);

            if (waybill.getDatilWaybillId() != null && shouldRefresh(waybill.getSriStatus())) {
                try {
                    refreshFromDatil(waybill);
                } catch (ApiException refreshEx) {
                    waybill.setSriErrorMessage(truncateError(refreshEx.getMessage()));
                }
            }
        } catch (ApiException ex) {
            waybill.setSriStatus("ERROR");
            waybill.setSriErrorMessage(truncateError(ex.getMessage()));
        }
    }

    private boolean shouldRefresh(String status) {
        return status == null
                || "ENVIADO".equalsIgnoreCase(status)
                || "RECIBIDO".equalsIgnoreCase(status)
                || "PENDIENTE".equalsIgnoreCase(status);
    }

    private ObjectNode buildPayload(Waybill waybill, int secuencial) {
        String transportDate = DATIL_DATE.format(waybill.getCreatedAt().atZone(ZoneOffset.systemDefault()));

        ObjectNode root = objectMapper.createObjectNode();
        root.put("ambiente", properties.getAmbiente());
        root.put("tipo_emision", 1);
        root.put("secuencial", secuencial);
        root.put("fecha_inicio_transporte", transportDate);
        root.put("fecha_fin_transporte", transportDate);
        root.put("direccion_partida", waybill.getDireccionPartida());

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

        ObjectNode transportista = root.putObject("transportista");
        transportista.put("razon_social", waybill.getCarrierName());
        transportista.put("identificacion", TaxIdValidator.normalize(waybill.getCarrierTaxId()));
        transportista.put("tipo_identificacion", TaxIdValidator.resolveIdType(waybill.getCarrierTaxId()));
        transportista.put("placa", waybill.getCarrierPlate());
        if (waybill.getCarrierEmail() != null && !waybill.getCarrierEmail().isBlank()) {
            transportista.put("email", waybill.getCarrierEmail());
        }
        if (waybill.getCarrierAddress() != null && !waybill.getCarrierAddress().isBlank()) {
            transportista.put("direccion", waybill.getCarrierAddress());
        }
        if (waybill.getCarrierPhone() != null && !waybill.getCarrierPhone().isBlank()) {
            transportista.put("telefono", waybill.getCarrierPhone());
        }

        ObjectNode destinatario = objectMapper.createObjectNode();
        destinatario.put("razon_social", waybill.getRecipientName());
        destinatario.put("identificacion", TaxIdValidator.normalize(waybill.getRecipientTaxId()));
        destinatario.put("tipo_identificacion", TaxIdValidator.resolveIdType(waybill.getRecipientTaxId()));
        destinatario.put("direccion", waybill.getRecipientAddress());
        destinatario.put("motivo_traslado", waybill.getMotivoTraslado());
        if (waybill.getRecipientEmail() != null && !waybill.getRecipientEmail().isBlank()) {
            destinatario.put("email", waybill.getRecipientEmail());
        }
        if (waybill.getRecipientPhone() != null && !waybill.getRecipientPhone().isBlank()) {
            destinatario.put("telefono", waybill.getRecipientPhone());
        }
        if (waybill.getRuta() != null && !waybill.getRuta().isBlank()) {
            destinatario.put("ruta", waybill.getRuta());
        }
        destinatario.put("documento_aduanero_unico", "");
        destinatario.put("codigo_establecimiento_destino", properties.getEstablecimientoCodigo());

        Invoice invoice = waybill.getInvoice();
        if (invoice != null && invoice.getSriDocumentNumber() != null) {
            destinatario.put("numero_documento_sustento", invoice.getSriDocumentNumber());
            destinatario.put("tipo_documento_sustento", "01");
            destinatario.put("fecha_emision_documento_sustento", resolveInvoiceDate(invoice));
            if (invoice.getSriAuthorizationNumber() != null && !invoice.getSriAuthorizationNumber().isBlank()) {
                destinatario.put("numero_autorizacion_documento_sustento", invoice.getSriAuthorizationNumber());
            }
        }

        ArrayNode items = destinatario.putArray("items");
        for (WaybillItem item : waybill.getItems()) {
            ObjectNode line = items.addObject();
            line.put("cantidad", item.getQuantity());
            line.put("codigo_principal", blankTo(item.getSku(), "ITEM-" + item.getProductId()));
            line.put("descripcion", item.getProductName());
        }

        ArrayNode destinatarios = root.putArray("destinatarios");
        destinatarios.add(destinatario);

        return root;
    }

    private String resolveInvoiceDate(Invoice invoice) {
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
                // fallback
            }
        }
        return DATIL_DATE.format(invoice.getCreatedAt().atZone(ZoneOffset.systemDefault()));
    }

    private static String truncateError(String message) {
        if (message == null) return null;
        return message.length() > 1000 ? message.substring(0, 997) + "…" : message;
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
