package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.model.CreditNote;
import com.adrian.inventory.model.DebitNote;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.PurchaseSettlement;
import com.adrian.inventory.model.Retention;
import com.adrian.inventory.model.Waybill;
import com.adrian.inventory.service.sri.SriEmitterContext;
import com.fasterxml.jackson.databind.JsonNode;

public record SriDocumentFields(
        String datilId,
        String status,
        String accessKey,
        String authorizationNumber,
        String documentNumber,
        String ridePdfUrl,
        String xmlUrl,
        String errorMessage) {

    private static final String DATIL_RIDE_BASE = "https://app.datil.co/ver/";

    public static SriDocumentFields fromFactuplan(JsonNode response, SriEmitterContext emitter) {
        if (response == null || response.isNull()) {
            return new SriDocumentFields(null, "ERROR", null, null, null, null, null, "Respuesta vacía de Factuplan");
        }

        String receiptId = firstText(response, "id", "receiptId");
        String accessKey = firstText(response, "accessKey", "claveAcceso");
        String documentNumber = firstText(response, "documentNumber", "sequential", "numero");
        String rawStatus = firstText(response, "status", "estado");
        String status = mapFactuplanStatus(rawStatus);

        String authorizationNumber = firstText(response, "authorizationNumber", "numeroAutorizacion");
        String ridePdfUrl = firstText(response, "pdfUrl", "ridePdfUrl");
        String xmlUrl = firstText(response, "xmlUrl");

        String errorMessage = null;
        if (!"AUTORIZADO".equalsIgnoreCase(status)) {
            errorMessage = firstText(response, "message", "errorMessage");
            if (errorMessage == null && response.has("error")) {
                errorMessage = response.path("error").path("message").asText(null);
            }
        }

        if (documentNumber != null && documentNumber.matches("\\d+")) {
            try {
                int seq = Integer.parseInt(documentNumber);
                documentNumber = SriDocumentNumber.format(
                        emitter.establecimientoCodigo(), emitter.puntoEmision(), seq);
            } catch (NumberFormatException ignored) {
                // keep as-is
            }
        }

        return new SriDocumentFields(
                receiptId,
                status,
                accessKey,
                authorizationNumber,
                documentNumber,
                ridePdfUrl,
                xmlUrl,
                errorMessage);
    }

    public static SriDocumentFields fromFactuplan(JsonNode response, DatilProperties properties) {
        SriEmitterContext emitter = new SriEmitterContext(
                properties.getRuc(),
                properties.getRazonSocial(),
                properties.getNombreComercial(),
                properties.getDireccion(),
                properties.getEstablecimientoCodigo(),
                properties.getPuntoEmision(),
                properties.getEstablecimientoDireccion(),
                properties.getIvaRate(),
                parseIvaCodigo(properties.getIvaCodigoPorcentaje()),
                properties.isPricesIncludeIva(),
                properties.isAgenteRetencion(),
                properties.getAgenteRetencionResolucion());
        return fromFactuplan(response, emitter);
    }

    private static String mapFactuplanStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            return "RECIBIDO";
        }
        return switch (raw.toUpperCase()) {
            case "COMPLETED", "AUTHORIZED" -> "AUTORIZADO";
            case "PROCESSING", "PENDING" -> "RECIBIDO";
            case "REJECTED", "NO AUTORIZADO" -> "NO AUTORIZADO";
            case "ERROR" -> "ERROR";
            default -> raw;
        };
    }

    private static int parseIvaCodigo(String code) {
        if (code == null || code.isBlank()) {
            return 4;
        }
        try {
            return Integer.parseInt(code.trim());
        } catch (NumberFormatException ex) {
            return 4;
        }
    }

    private static String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            if (node.hasNonNull(field) && !node.get(field).asText().isBlank()) {
                return node.get(field).asText();
            }
        }
        return null;
    }

    public static SriDocumentFields fromDatil(JsonNode response, DatilProperties properties) {
        if (response == null || response.isNull()) {
            return new SriDocumentFields(null, "ERROR", null, null, null, null, null, "Respuesta vacía de Datil");
        }

        String datilId = textOrNull(response, "id");
        String accessKey = textOrNull(response, "clave_acceso");
        String documentNumber = textOrNull(response, "numero");
        String ridePdfUrl = textOrNull(response, "url_formato_impresion");
        String xmlUrl = textOrNull(response, "url_documento_electronico");

        if ((ridePdfUrl == null || ridePdfUrl.isBlank()) && datilId != null) {
            ridePdfUrl = DATIL_RIDE_BASE + datilId + "/pdf";
        }
        if ((xmlUrl == null || xmlUrl.isBlank()) && datilId != null) {
            xmlUrl = DATIL_RIDE_BASE + datilId + "/xml";
        }

        String status = textOrNull(response, "estado");
        if (status == null) {
            status = "ENVIADO";
        }

        String authorizationNumber = null;
        JsonNode autorizacion = response.path("autorizacion");
        if (autorizacion.hasNonNull("numero")) {
            authorizationNumber = autorizacion.get("numero").asText();
        } else if (response.path("autorizacion_sri").hasNonNull("numero_autorizacion")) {
            authorizationNumber = response.path("autorizacion_sri").get("numero_autorizacion").asText();
        }

        String errorMessage = null;
        if (!"AUTORIZADO".equalsIgnoreCase(status)) {
            errorMessage = firstMessage(response.path("mensajes"));
            if (errorMessage == null) {
                errorMessage = firstMessage(autorizacion.path("mensajes"));
            }
            if (errorMessage == null) {
                errorMessage = firstMessage(response.path("envio_sri").path("mensajes"));
            }
        }

        return new SriDocumentFields(
                datilId,
                status,
                accessKey,
                authorizationNumber,
                documentNumber,
                ridePdfUrl,
                xmlUrl,
                errorMessage);
    }

    public void applyTo(Invoice invoice, SriEmitterContext emitter) {
        if (datilId != null) {
            invoice.setDatilInvoiceId(datilId);
        }
        if (accessKey != null) {
            invoice.setSriAccessKey(accessKey);
        }
        invoice.setSriStatus(status);

        if (authorizationNumber != null) {
            invoice.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            invoice.setSriDocumentNumber(documentNumber);
        } else if (invoice.getSriSecuencial() != null) {
            invoice.setSriDocumentNumber(SriDocumentNumber.format(
                    emitter.establecimientoCodigo(),
                    emitter.puntoEmision(),
                    invoice.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            invoice.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            invoice.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            invoice.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            invoice.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(Invoice invoice, DatilProperties properties) {
        if (datilId != null) {
            invoice.setDatilInvoiceId(datilId);
        }
        if (accessKey != null) {
            invoice.setSriAccessKey(accessKey);
        }
        invoice.setSriStatus(status);

        if (authorizationNumber != null) {
            invoice.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            invoice.setSriDocumentNumber(documentNumber);
        } else if (invoice.getSriSecuencial() != null) {
            invoice.setSriDocumentNumber(SriDocumentNumber.format(
                    properties.getEstablecimientoCodigo(),
                    properties.getPuntoEmision(),
                    invoice.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            invoice.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            invoice.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            invoice.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            invoice.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(CreditNote creditNote, DatilProperties properties) {
        if (datilId != null) {
            creditNote.setDatilCreditNoteId(datilId);
        }
        if (accessKey != null) {
            creditNote.setSriAccessKey(accessKey);
        }
        creditNote.setSriStatus(status);

        if (authorizationNumber != null) {
            creditNote.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            creditNote.setSriDocumentNumber(documentNumber);
        } else if (creditNote.getSriSecuencial() != null) {
            creditNote.setSriDocumentNumber(SriDocumentNumber.format(
                    properties.getEstablecimientoCodigo(),
                    properties.getPuntoEmision(),
                    creditNote.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            creditNote.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            creditNote.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            creditNote.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            creditNote.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(CreditNote creditNote, SriEmitterContext emitter) {
        if (datilId != null) {
            creditNote.setDatilCreditNoteId(datilId);
        }
        if (accessKey != null) {
            creditNote.setSriAccessKey(accessKey);
        }
        creditNote.setSriStatus(status);

        if (authorizationNumber != null) {
            creditNote.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            creditNote.setSriDocumentNumber(documentNumber);
        } else if (creditNote.getSriSecuencial() != null) {
            creditNote.setSriDocumentNumber(SriDocumentNumber.format(
                    emitter.establecimientoCodigo(),
                    emitter.puntoEmision(),
                    creditNote.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            creditNote.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            creditNote.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            creditNote.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            creditNote.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(DebitNote debitNote, DatilProperties properties) {
        if (datilId != null) {
            debitNote.setDatilDebitNoteId(datilId);
        }
        if (accessKey != null) {
            debitNote.setSriAccessKey(accessKey);
        }
        debitNote.setSriStatus(status);

        if (authorizationNumber != null) {
            debitNote.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            debitNote.setSriDocumentNumber(documentNumber);
        } else if (debitNote.getSriSecuencial() != null) {
            debitNote.setSriDocumentNumber(SriDocumentNumber.format(
                    properties.getEstablecimientoCodigo(),
                    properties.getPuntoEmision(),
                    debitNote.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            debitNote.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            debitNote.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            debitNote.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            debitNote.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(DebitNote debitNote, SriEmitterContext emitter) {
        if (datilId != null) {
            debitNote.setDatilDebitNoteId(datilId);
        }
        if (accessKey != null) {
            debitNote.setSriAccessKey(accessKey);
        }
        debitNote.setSriStatus(status);

        if (authorizationNumber != null) {
            debitNote.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            debitNote.setSriDocumentNumber(documentNumber);
        } else if (debitNote.getSriSecuencial() != null) {
            debitNote.setSriDocumentNumber(SriDocumentNumber.format(
                    emitter.establecimientoCodigo(),
                    emitter.puntoEmision(),
                    debitNote.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            debitNote.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            debitNote.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            debitNote.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            debitNote.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(Waybill waybill, DatilProperties properties) {
        if (datilId != null) {
            waybill.setDatilWaybillId(datilId);
        }
        if (accessKey != null) {
            waybill.setSriAccessKey(accessKey);
        }
        waybill.setSriStatus(status);

        if (authorizationNumber != null) {
            waybill.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            waybill.setSriDocumentNumber(documentNumber);
        } else if (waybill.getSriSecuencial() != null) {
            waybill.setSriDocumentNumber(SriDocumentNumber.format(
                    properties.getEstablecimientoCodigo(),
                    properties.getPuntoEmision(),
                    waybill.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            waybill.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            waybill.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            waybill.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            waybill.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(Waybill waybill, SriEmitterContext emitter) {
        if (datilId != null) {
            waybill.setDatilWaybillId(datilId);
        }
        if (accessKey != null) {
            waybill.setSriAccessKey(accessKey);
        }
        waybill.setSriStatus(status);

        if (authorizationNumber != null) {
            waybill.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            waybill.setSriDocumentNumber(documentNumber);
        } else if (waybill.getSriSecuencial() != null) {
            waybill.setSriDocumentNumber(SriDocumentNumber.format(
                    emitter.establecimientoCodigo(),
                    emitter.puntoEmision(),
                    waybill.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            waybill.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            waybill.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            waybill.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            waybill.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(PurchaseSettlement settlement, DatilProperties properties) {
        if (datilId != null) {
            settlement.setDatilPurchaseSettlementId(datilId);
        }
        if (accessKey != null) {
            settlement.setSriAccessKey(accessKey);
        }
        settlement.setSriStatus(status);

        if (authorizationNumber != null) {
            settlement.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            settlement.setSriDocumentNumber(documentNumber);
        } else if (settlement.getSriSecuencial() != null) {
            settlement.setSriDocumentNumber(SriDocumentNumber.format(
                    properties.getEstablecimientoCodigo(),
                    properties.getPuntoEmision(),
                    settlement.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            settlement.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            settlement.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            settlement.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            settlement.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(Retention retention, DatilProperties properties) {
        if (datilId != null) {
            retention.setDatilRetentionId(datilId);
        }
        if (accessKey != null) {
            retention.setSriAccessKey(accessKey);
        }
        retention.setSriStatus(status);

        if (authorizationNumber != null) {
            retention.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            retention.setSriDocumentNumber(documentNumber);
        } else if (retention.getSriSecuencial() != null) {
            retention.setSriDocumentNumber(SriDocumentNumber.format(
                    properties.getEstablecimientoCodigo(),
                    properties.getPuntoEmision(),
                    retention.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            retention.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            retention.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            retention.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            retention.setSriErrorMessage(errorMessage);
        }
    }

    public void applyTo(Retention retention, SriEmitterContext emitter) {
        if (datilId != null) {
            retention.setDatilRetentionId(datilId);
        }
        if (accessKey != null) {
            retention.setSriAccessKey(accessKey);
        }
        retention.setSriStatus(status);

        if (authorizationNumber != null) {
            retention.setSriAuthorizationNumber(authorizationNumber);
        }

        if (documentNumber != null && !documentNumber.isBlank()) {
            retention.setSriDocumentNumber(documentNumber);
        } else if (retention.getSriSecuencial() != null) {
            retention.setSriDocumentNumber(SriDocumentNumber.format(
                    emitter.establecimientoCodigo(),
                    emitter.puntoEmision(),
                    retention.getSriSecuencial()));
        }

        if (ridePdfUrl != null) {
            retention.setSriRidePdfUrl(ridePdfUrl);
        }
        if (xmlUrl != null) {
            retention.setSriXmlUrl(xmlUrl);
        }

        if ("AUTORIZADO".equalsIgnoreCase(status)) {
            retention.setSriErrorMessage(null);
        } else if (errorMessage != null) {
            retention.setSriErrorMessage(errorMessage);
        }
    }

    private static String textOrNull(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }

    private static String firstMessage(JsonNode messages) {
        if (!messages.isArray() || messages.isEmpty()) {
            return null;
        }
        StringBuilder details = new StringBuilder();
        for (JsonNode message : messages) {
            if (!details.isEmpty()) {
                details.append("; ");
            }
            if (message.isTextual()) {
                details.append(message.asText());
            } else if (message.has("mensaje")) {
                details.append(message.get("mensaje").asText());
            } else if (message.has("informacion_adicional") && !message.get("informacion_adicional").asText().isBlank()) {
                details.append(message.get("informacion_adicional").asText());
            }
        }
        return details.isEmpty() ? null : details.toString();
    }
}
