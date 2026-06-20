package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class DatilClient {

    private final RestClient restClient;
    private final DatilProperties properties;
    private final ObjectMapper objectMapper;

    public DatilClient(RestClient datilRestClient, DatilProperties properties, ObjectMapper objectMapper) {
        this.restClient = datilRestClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public JsonNode issue(SriDocumentType type, JsonNode payload, String idempotencyKey) {
        ensureConfigured();
        return post("/" + type.getApiResource() + "/issue", payload, idempotencyKey);
    }

    public JsonNode get(SriDocumentType type, String datilId) {
        ensureConfigured();
        try {
            return restClient.get()
                    .uri("/{resource}/{id}", type.getApiResource(), datilId)
                    .header("X-Key", properties.getApiKey())
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException ex) {
            String detail = extractError(ex.getResponseBodyAsString());
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar el comprobante en Datil: " + detail);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Error consultando Datil: " + ex.getMessage());
        }
    }

    public JsonNode reissue(SriDocumentType type, String datilId, JsonNode payload) {
        ensureConfigured();
        return post("/" + type.getApiResource() + "/" + datilId + "/reissue", payload, "reissue-" + datilId);
    }

    public JsonNode issueInvoice(JsonNode payload, String idempotencyKey) {
        return issue(SriDocumentType.INVOICE, payload, idempotencyKey);
    }

    public JsonNode getInvoice(String datilInvoiceId) {
        return get(SriDocumentType.INVOICE, datilInvoiceId);
    }

    public JsonNode reissueInvoice(String datilInvoiceId, JsonNode payload) {
        return reissue(SriDocumentType.INVOICE, datilInvoiceId, payload);
    }

    private JsonNode post(String uri, JsonNode payload, String idempotencyKey) {
        try {
            return restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-Key", properties.getApiKey())
                    .header("X-Password", properties.getCertificatePassword())
                    .header("X-Idempotency-Key", idempotencyKey)
                    .body(payload)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException ex) {
            String detail = extractError(ex.getResponseBodyAsString());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Datil rechazó la emisión: " + detail);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "No se pudo conectar con Datil: " + ex.getMessage());
        }
    }

    private void ensureConfigured() {
        if (!properties.isConfigured()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Facturación SRI no configurada. Revise las variables DATIL_* en el servidor.");
        }
    }

    private String extractError(String body) {
        if (body == null || body.isBlank()) {
            return "sin detalle";
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            if (node.has("parameter")) {
                String parameter = node.get("parameter").asText();
                String details = node.has("details") ? node.get("details").asText() : node.path("message").asText();
                return parameter + ": " + details;
            }
            if (node.has("errors") && node.get("errors").isArray() && !node.get("errors").isEmpty()) {
                StringBuilder details = new StringBuilder();
                for (JsonNode error : node.get("errors")) {
                    if (!details.isEmpty()) {
                        details.append("; ");
                    }
                    if (error.has("path")) {
                        details.append(error.get("path").asText()).append(": ");
                    } else if (error.has("parameter")) {
                        details.append(error.get("parameter").asText()).append(": ");
                    } else if (error.has("campo")) {
                        details.append(error.get("campo").asText()).append(": ");
                    }
                    if (error.has("details")) {
                        details.append(error.get("details").asText());
                    } else if (error.has("mensaje")) {
                        details.append(error.get("mensaje").asText());
                    } else if (error.has("message")) {
                        details.append(error.get("message").asText());
                    }
                }
                if (!details.isEmpty()) {
                    return details.toString();
                }
                JsonNode first = node.get("errors").get(0);
                if (first.has("details")) return first.get("details").asText();
                if (first.has("mensaje")) return first.get("mensaje").asText();
            }
            if (node.has("mensaje")) return node.get("mensaje").asText();
            if (node.has("message")) return node.get("message").asText();
            if (node.has("error")) return node.get("error").asText();
        } catch (Exception ignored) {
            // fallback to raw body
        }
        return body.length() > 300 ? body.substring(0, 300) + "…" : body;
    }
}
