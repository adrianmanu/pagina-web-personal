package com.adrian.inventory.service;

import com.adrian.inventory.config.FactuplanProperties;
import com.adrian.inventory.config.SriProviderProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.CreditNote;
import com.adrian.inventory.model.DebitNote;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.Retention;
import com.adrian.inventory.model.Waybill;
import com.adrian.inventory.repository.CreditNoteRepository;
import com.adrian.inventory.repository.DebitNoteRepository;
import com.adrian.inventory.repository.InvoiceRepository;
import com.adrian.inventory.repository.RetentionRepository;
import com.adrian.inventory.repository.WaybillRepository;
import com.adrian.inventory.service.sri.FactuplanSriDocumentsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Service
public class FactuplanWebhookService {

    private final FactuplanProperties factuplanProperties;
    private final SriProviderProperties providerProperties;
    private final ObjectMapper objectMapper;
    private final InvoiceRepository invoiceRepository;
    private final CreditNoteRepository creditNoteRepository;
    private final DebitNoteRepository debitNoteRepository;
    private final WaybillRepository waybillRepository;
    private final RetentionRepository retentionRepository;
    private final SriBillingService sriBillingService;
    private final FactuplanSriDocumentsService factuplanDocumentsService;

    public FactuplanWebhookService(
            FactuplanProperties factuplanProperties,
            SriProviderProperties providerProperties,
            ObjectMapper objectMapper,
            InvoiceRepository invoiceRepository,
            CreditNoteRepository creditNoteRepository,
            DebitNoteRepository debitNoteRepository,
            WaybillRepository waybillRepository,
            RetentionRepository retentionRepository,
            SriBillingService sriBillingService,
            FactuplanSriDocumentsService factuplanDocumentsService) {
        this.factuplanProperties = factuplanProperties;
        this.providerProperties = providerProperties;
        this.objectMapper = objectMapper;
        this.invoiceRepository = invoiceRepository;
        this.creditNoteRepository = creditNoteRepository;
        this.debitNoteRepository = debitNoteRepository;
        this.waybillRepository = waybillRepository;
        this.retentionRepository = retentionRepository;
        this.sriBillingService = sriBillingService;
        this.factuplanDocumentsService = factuplanDocumentsService;
    }

    @Transactional
    public void handle(String rawBody, String signatureHeader) {
        if (!providerProperties.isFactuplan()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Webhooks Factuplan deshabilitados (proveedor no es factuplan)");
        }
        verifySignature(rawBody, signatureHeader);

        JsonNode root;
        try {
            root = objectMapper.readTree(rawBody);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payload webhook inválido");
        }

        String receiptId = extractReceiptId(root);
        if (receiptId == null || receiptId.isBlank()) {
            return;
        }

        if (refreshIfPresent(invoiceRepository.findFirstByDatilInvoiceId(receiptId), this::refreshInvoice)) {
            return;
        }
        if (refreshIfPresent(creditNoteRepository.findFirstByDatilCreditNoteId(receiptId), this::refreshCreditNote)) {
            return;
        }
        if (refreshIfPresent(debitNoteRepository.findFirstByDatilDebitNoteId(receiptId), this::refreshDebitNote)) {
            return;
        }
        if (refreshIfPresent(waybillRepository.findFirstByDatilWaybillId(receiptId), this::refreshWaybill)) {
            return;
        }
        refreshIfPresent(retentionRepository.findFirstByDatilRetentionId(receiptId), this::refreshRetention);
    }

    private void verifySignature(String rawBody, String signatureHeader) {
        if (!factuplanProperties.isWebhookConfigured()) {
            return;
        }
        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Firma webhook ausente");
        }
        String expected = hmacSha256(rawBody, factuplanProperties.getWebhookSecret());
        String provided = signatureHeader.trim();
        if (provided.startsWith("sha256=")) {
            provided = provided.substring(7);
        }
        if (!constantTimeEquals(expected, provided)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Firma webhook inválida");
        }
    }

    private String extractReceiptId(JsonNode root) {
        JsonNode data = root.path("data");
        if (data.hasNonNull("id")) {
            return data.get("id").asText();
        }
        if (data.hasNonNull("receiptId")) {
            return data.get("receiptId").asText();
        }
        if (root.hasNonNull("receiptId")) {
            return root.get("receiptId").asText();
        }
        return null;
    }

    private <T> boolean refreshIfPresent(java.util.Optional<T> entity, java.util.function.Consumer<T> refresher) {
        if (entity.isEmpty()) {
            return false;
        }
        refresher.accept(entity.get());
        return true;
    }

    private void refreshInvoice(Invoice invoice) {
        sriBillingService.refreshFromProvider(invoice);
        invoiceRepository.save(invoice);
    }

    private void refreshCreditNote(CreditNote creditNote) {
        factuplanDocumentsService.refreshCreditNote(creditNote);
        creditNoteRepository.save(creditNote);
    }

    private void refreshDebitNote(DebitNote debitNote) {
        factuplanDocumentsService.refreshDebitNote(debitNote);
        debitNoteRepository.save(debitNote);
    }

    private void refreshWaybill(Waybill waybill) {
        factuplanDocumentsService.refreshWaybill(waybill);
        waybillRepository.save(waybill);
    }

    private void refreshRetention(Retention retention) {
        factuplanDocumentsService.refreshRetention(retention);
        retentionRepository.save(retention);
    }

    private static String hmacSha256(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo verificar la firma webhook");
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        byte[] left = a.getBytes(StandardCharsets.UTF_8);
        byte[] right = b.getBytes(StandardCharsets.UTF_8);
        if (left.length != right.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < left.length; i++) {
            result |= left[i] ^ right[i];
        }
        return result == 0;
    }
}
