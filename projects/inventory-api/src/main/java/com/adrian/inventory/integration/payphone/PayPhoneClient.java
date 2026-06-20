package com.adrian.inventory.integration.payphone;

import com.adrian.inventory.config.PayPhoneProperties;
import com.adrian.inventory.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Component
public class PayPhoneClient {

    private final RestClient restClient;
    private final PayPhoneProperties properties;
    private final ObjectMapper objectMapper;

    public PayPhoneClient(RestClient payphoneRestClient, PayPhoneProperties properties, ObjectMapper objectMapper) {
        this.restClient = payphoneRestClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public JsonNode prepareTransaction(
            String clientTransactionId,
            int amountCents,
            String reference) {
        try {
            var body = objectMapper.createObjectNode();
            body.put("amount", amountCents);
            body.put("amountWithoutTax", amountCents);
            body.put("currency", "USD");
            body.put("clientTransactionId", clientTransactionId);
            body.put("reference", reference);
            body.put("responseUrl", properties.getResponseUrl());
            if (properties.getStoreId() != null && !properties.getStoreId().isBlank()) {
                body.put("storeId", properties.getStoreId());
            }

            String response = restClient
                    .post()
                    .uri("/button/Prepare")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.getToken())
                    .body(objectMapper.writeValueAsString(body))
                    .retrieve()
                    .body(String.class);
            return objectMapper.readTree(response);
        } catch (RestClientResponseException ex) {
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "PayPhone no pudo preparar el pago: " + extractMessage(ex.getResponseBodyAsString()));
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Error al preparar pago PayPhone: " + ex.getMessage());
        }
    }

    public JsonNode confirmTransaction(long payphoneId, String clientTxId) {
        try {
            String body = objectMapper.writeValueAsString(Map.of("id", payphoneId, "clientTxId", clientTxId));
            String response = restClient
                    .post()
                    .uri("/button/V2/Confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.getToken())
                    .body(body)
                    .retrieve()
                    .body(String.class);
            return objectMapper.readTree(response);
        } catch (RestClientResponseException ex) {
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "PayPhone no pudo confirmar el pago: " + extractMessage(ex.getResponseBodyAsString()));
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Error al confirmar pago PayPhone: " + ex.getMessage());
        }
    }

    private String extractMessage(String body) {
        if (body == null || body.isBlank()) {
            return "sin detalle";
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            if (node.hasNonNull("message")) {
                return node.get("message").asText();
            }
        } catch (Exception ignored) {
            // usar cuerpo crudo
        }
        return body.length() > 200 ? body.substring(0, 200) : body;
    }
}
