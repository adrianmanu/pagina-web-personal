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

    public JsonNode issueInvoice(JsonNode payload, String idempotencyKey) {
        ensureConfigured();
        try {
            return restClient.post()
                    .uri("/invoices/issue")
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

    public JsonNode getInvoice(String datilInvoiceId) {
        ensureConfigured();
        try {
            return restClient.get()
                    .uri("/invoices/{id}", datilInvoiceId)
                    .header("X-Key", properties.getApiKey())
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException ex) {
            String detail = extractError(ex.getResponseBodyAsString());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "No se pudo consultar la factura en Datil: " + detail);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Error consultando Datil: " + ex.getMessage());
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
            if (node.has("mensaje")) return node.get("mensaje").asText();
            if (node.has("message")) return node.get("message").asText();
            if (node.has("error")) return node.get("error").asText();
        } catch (Exception ignored) {
            // fallback to raw body
        }
        return body.length() > 300 ? body.substring(0, 300) + "…" : body;
    }
}
