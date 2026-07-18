package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.config.FactuplanProperties;
import com.adrian.inventory.config.SriProviderProperties;
import com.adrian.inventory.dto.SriCertificateStatusResponse;
import com.adrian.inventory.dto.SriCertificateUploadResponse;
import com.adrian.inventory.dto.SriConfigResponse;
import com.adrian.inventory.dto.SriConnectionVerifyResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.User;
import com.adrian.inventory.service.sri.FactuplanClient;
import com.adrian.inventory.service.sri.SriEmitterContext;
import com.adrian.inventory.service.sri.SriEmitterResolver;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SriConnectionService {

    private final SriProviderProperties providerProperties;
    private final DatilProperties datilProperties;
    private final FactuplanProperties factuplanProperties;
    private final FactuplanClient factuplanClient;
    private final SriEmitterResolver emitterResolver;

    public SriConnectionService(
            SriProviderProperties providerProperties,
            DatilProperties datilProperties,
            FactuplanProperties factuplanProperties,
            FactuplanClient factuplanClient,
            SriEmitterResolver emitterResolver) {
        this.providerProperties = providerProperties;
        this.datilProperties = datilProperties;
        this.factuplanProperties = factuplanProperties;
        this.factuplanClient = factuplanClient;
        this.emitterResolver = emitterResolver;
    }

    public SriConfigResponse getConfig(User user) {
        SriEmitterContext emitter = emitterResolver.resolve(user);
        boolean configured = isBillingEnabled() && emitter.hasRuc();
        int ambiente = providerProperties.isFactuplan()
                ? (factuplanProperties.isTestKey() ? 1 : 2)
                : datilProperties.getAmbiente();

        return new SriConfigResponse(
                isBillingEnabled(),
                configured,
                providerProperties.getProvider().name().toLowerCase(),
                ambiente,
                emitter.ruc(),
                emitter.razonSocial(),
                emitter.establecimientoCodigo(),
                emitter.puntoEmision(),
                emitter.agenteRetencion(),
                emitter.agenteRetencionResolucion());
    }

    public SriCertificateStatusResponse getCertificateStatus(User user) {
        requireFactuplan();
        SriEmitterContext emitter = emitterResolver.require(user);
        JsonNode data = FactuplanClient.unwrapData(
                factuplanClient.getCertificateStatus(emitter.ruc()));

        return new SriCertificateStatusResponse(
                certificateValid(data),
                data.path("hasCertificate").asBoolean(false),
                textOrNull(data, "taxpayerId", "ruc"),
                textOrNull(data, "commonName", "legalName"),
                textOrNull(data, "expiresAt"),
                data.has("daysUntilExpiry") ? data.get("daysUntilExpiry").asInt() : null);
    }

    public SriCertificateUploadResponse uploadCertificate(User user, MultipartFile file, String password) {
        requireFactuplan();
        SriEmitterContext emitter = emitterResolver.require(user);
        validateCertificateFile(file);
        if (password == null || password.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La contraseña del certificado es obligatoria");
        }

        try {
            byte[] bytes = file.getBytes();
            JsonNode data = FactuplanClient.unwrapData(
                    factuplanClient.uploadCertificate(bytes, password.trim(), emitter.ruc()));

            return new SriCertificateUploadResponse(
                    data.path("hasCertificate").asBoolean(true),
                    textOrNull(data, "ruc", "taxpayerId"),
                    textOrNull(data, "legalName", "commonName"),
                    textOrNull(data, "expiresAt"),
                    data.path("created").asBoolean(false),
                    "Certificado cargado en Factuplan correctamente");
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No se pudo leer el archivo .p12: " + ex.getMessage());
        }
    }

    public SriConnectionVerifyResponse verifyConnection(User user) {
        if (!providerProperties.isFactuplan()) {
            boolean ok = datilProperties.isEnabled() && datilProperties.getApiKey() != null;
            return new SriConnectionVerifyResponse(
                    ok,
                    "datil",
                    datilProperties.getAmbiente(),
                    datilProperties.getRuc(),
                    ok,
                    true,
                    true,
                    ok ? "Datil configurado en el servidor" : "Datil no está habilitado en el servidor");
        }

        requireFactuplan();
        SriEmitterContext emitter = emitterResolver.require(user);
        boolean apiConfigured = factuplanProperties.isApiKeyConfigured();

        boolean hasCertificate = false;
        boolean certificateValid = false;
        String certMessage = "Sin certificado cargado";

        try {
            SriCertificateStatusResponse status = getCertificateStatus(user);
            hasCertificate = status.hasCertificate();
            certificateValid = status.valid();
            if (hasCertificate) {
                certMessage = certificateValid
                        ? "Certificado válido"
                        : "Certificado cargado pero no válido o vencido";
            }
        } catch (ApiException ex) {
            if (ex.getStatus() == HttpStatus.UNAUTHORIZED || ex.getStatus() == HttpStatus.FORBIDDEN) {
                return new SriConnectionVerifyResponse(
                        false,
                        "factuplan",
                        factuplanProperties.isTestKey() ? 1 : 2,
                        emitter.ruc(),
                        false,
                        false,
                        false,
                        "API key inválida: " + ex.getMessage());
            }
            if (factuplanProperties.isTestKey()) {
                certMessage = "Modo pruebas (ak_test_*): certificado P12 no requerido; Factuplan simula la firma";
            } else {
                certMessage = ex.getMessage();
            }
        }

        boolean ok = apiConfigured && (certificateValid || factuplanProperties.isTestKey());
        String message;
        if (!apiConfigured) {
            message = "FACTUPLAN_API_KEY no configurada";
        } else if (ok && factuplanProperties.isTestKey() && !hasCertificate) {
            message = "Conexión Factuplan OK — Modo pruebas activo; puede emitir sin certificado P12";
        } else if (ok) {
            message = "Conexión Factuplan OK — " + certMessage;
        } else {
            message = certMessage + ". Suba su firma electrónica (.p12) para emitir en producción.";
        }

        return new SriConnectionVerifyResponse(
                ok,
                "factuplan",
                factuplanProperties.isTestKey() ? 1 : 2,
                emitter.ruc(),
                apiConfigured,
                hasCertificate,
                certificateValid,
                message);
    }

    private boolean isBillingEnabled() {
        return providerProperties.isFactuplan()
                ? factuplanProperties.isEnabled()
                : datilProperties.isEnabled();
    }

    private void requireFactuplan() {
        if (!providerProperties.isFactuplan()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "La carga de certificado por API solo está disponible con el proveedor Factuplan");
        }
        if (!factuplanProperties.isApiKeyConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "FACTUPLAN_API_KEY no configurada en el servidor");
        }
    }

    private static void validateCertificateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Debe adjuntar el archivo .p12");
        }
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!name.endsWith(".p12") && !name.endsWith(".pfx")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El certificado debe ser un archivo .p12 o .pfx");
        }
    }

    private static String textOrNull(JsonNode node, String... fields) {
        for (String field : fields) {
            if (node.hasNonNull(field) && !node.get(field).asText().isBlank()) {
                return node.get(field).asText();
            }
        }
        return null;
    }

    private static boolean certificateValid(JsonNode data) {
        if (data.has("valid")) {
            return data.get("valid").asBoolean();
        }
        boolean hasCertificate = data.path("hasCertificate").asBoolean(false);
        boolean expired = data.path("isExpired").asBoolean(false);
        return hasCertificate && !expired;
    }
}
