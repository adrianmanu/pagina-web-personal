package com.adrian.inventory.service.sri;

import com.adrian.inventory.config.FactuplanProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.service.sri.SriEmitterContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class FactuplanClient {

    private final RestClient restClient;
    private final FactuplanProperties properties;
    private final ObjectMapper objectMapper;

    public FactuplanClient(RestClient factuplanRestClient, FactuplanProperties properties, ObjectMapper objectMapper) {
        this.restClient = factuplanRestClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public JsonNode createInvoice(JsonNode payload, String taxpayerRuc, String idempotencyKey) {
        ensureApiKey();
        return postJson("/v1/developer/invoices", payload, taxpayerRuc, idempotencyKey);
    }

    public JsonNode importInvoice(String accessKey, String taxpayerRuc) {
        ensureApiKey();
        ObjectNode body = objectMapper.createObjectNode();
        body.put("accessKey", accessKey);
        return postJson("/v1/developer/invoices/import", body, taxpayerRuc, null);
    }

    public JsonNode createCreditNote(JsonNode payload, String taxpayerRuc, String idempotencyKey) {
        ensureApiKey();
        return postJson("/v1/developer/credit-notes", payload, taxpayerRuc, idempotencyKey);
    }

    public JsonNode createDebitNote(JsonNode payload, String taxpayerRuc, String idempotencyKey) {
        ensureApiKey();
        return postJson("/v1/developer/debit-notes", payload, taxpayerRuc, idempotencyKey);
    }

    public JsonNode createWithholding(JsonNode payload, String taxpayerRuc, String idempotencyKey) {
        ensureApiKey();
        return postJson("/v1/developer/withholdings", payload, taxpayerRuc, idempotencyKey);
    }

    public JsonNode createWaybill(JsonNode payload, String taxpayerRuc, String idempotencyKey) {
        ensureApiKey();
        return postJson("/v1/developer/waybills", payload, taxpayerRuc, idempotencyKey);
    }

    public JsonNode getReceiptStatus(String receiptId, String taxpayerRuc) {
        ensureApiKey();
        return getJson("/v1/developer/receipts/" + receiptId + "/status", taxpayerRuc);
    }

    public JsonNode getReceipt(String receiptId, String taxpayerRuc) {
        ensureApiKey();
        return getJson("/v1/developer/receipts/" + receiptId, taxpayerRuc);
    }

    public JsonNode uploadCertificate(byte[] p12Bytes, String password, String taxpayerRuc) {
        ensureApiKey();
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(p12Bytes) {
                @Override
                public String getFilename() {
                    return "firma.p12";
                }
            }).contentType(MediaType.APPLICATION_OCTET_STREAM);
            builder.part("password", password);

            MultiValueMap<String, org.springframework.http.HttpEntity<?>> body = builder.build();

            String response = restClient.post()
                    .uri("/v1/developer/certificate")
                    .header("X-API-Key", properties.getApiKey())
                    .header("x-taxpayer-ruc", taxpayerRuc)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            return objectMapper.readTree(response);
        } catch (RestClientResponseException ex) {
            throw toApiException("No se pudo subir el certificado a Factuplan", ex);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Error subiendo certificado: " + ex.getMessage());
        }
    }

    public JsonNode getCertificateStatus(String taxpayerRuc) {
        ensureApiKey();
        // Estado del P12 es a nivel de cuenta; no requiere x-taxpayer-ruc según docs Factuplan.
        return getJson("/v1/developer/certificate/status", null);
    }

    public JsonNode getUsage() {
        ensureApiKey();
        return getJson("/v1/developer/usage", null);
    }

    public boolean isConfigured(SriEmitterContext emitter) {
        return properties.isEnabled()
                && properties.isApiKeyConfigured()
                && emitter != null
                && emitter.hasRuc();
    }

    private JsonNode postJson(String path, JsonNode payload, String taxpayerRuc, String idempotencyKey) {
        try {
            var spec = restClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-API-Key", properties.getApiKey())
                    .header("x-taxpayer-ruc", taxpayerRuc);
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                spec = spec.header("X-Idempotency-Key", idempotencyKey);
            }
            String response = spec.body(payload).retrieve().body(String.class);
            return objectMapper.readTree(response);
        } catch (RestClientResponseException ex) {
            throw toApiException("Factuplan rechazó la operación", ex);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "No se pudo conectar con Factuplan: " + ex.getMessage());
        }
    }

    private JsonNode getJson(String path, String taxpayerRuc) {
        try {
            var spec = restClient.get()
                    .uri(path)
                    .header("X-API-Key", properties.getApiKey());
            if (taxpayerRuc != null && !taxpayerRuc.isBlank()) {
                spec = spec.header("x-taxpayer-ruc", taxpayerRuc);
            }
            String response = spec.retrieve().body(String.class);
            return objectMapper.readTree(response);
        } catch (RestClientResponseException ex) {
            throw toApiException("No se pudo consultar Factuplan", ex);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Error consultando Factuplan: " + ex.getMessage());
        }
    }

    private void ensureApiKey() {
        if (!properties.isApiKeyConfigured()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Factuplan no configurado. Revise FACTUPLAN_API_KEY en el servidor.");
        }
    }

    private ApiException toApiException(String prefix, RestClientResponseException ex) {
        String detail = extractError(ex.getResponseBodyAsString());
        return new ApiException(HttpStatus.BAD_GATEWAY, prefix + ": " + detail);
    }

    private String extractError(String body) {
        if (body == null || body.isBlank()) {
            return "sin detalle";
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            JsonNode error = node.path("error");
            if (error.hasNonNull("message")) {
                String code = error.has("code") ? error.get("code").asText() + " — " : "";
                return code + error.get("message").asText();
            }
            if (node.has("message")) {
                return node.get("message").asText();
            }
        } catch (Exception ignored) {
            // fallback
        }
        return body.length() > 300 ? body.substring(0, 297) + "…" : body;
    }

    public static JsonNode unwrapData(JsonNode response) {
        if (response == null || response.isNull()) {
            return response;
        }
        if (response.has("data") && !response.get("data").isNull()) {
            return response.get("data");
        }
        return response;
    }
}
