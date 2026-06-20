package com.adrian.inventory.service;

import com.adrian.inventory.dto.RetentionItemRequest;
import com.adrian.inventory.dto.RetentionRequest;
import com.adrian.inventory.dto.RetentionResponse;
import com.adrian.inventory.dto.RetentionTaxCodeResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.ReceivedDocument;
import com.adrian.inventory.model.Retention;
import com.adrian.inventory.model.RetentionItem;
import com.adrian.inventory.model.Supplier;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.RetentionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RetentionService {

    private final RetentionRepository retentionRepository;
    private final SupplierService supplierService;
    private final ReceivedDocumentService receivedDocumentService;
    private final SriRetentionService sriRetentionService;

    public RetentionService(
            RetentionRepository retentionRepository,
            SupplierService supplierService,
            ReceivedDocumentService receivedDocumentService,
            SriRetentionService sriRetentionService) {
        this.retentionRepository = retentionRepository;
        this.supplierService = supplierService;
        this.receivedDocumentService = receivedDocumentService;
        this.sriRetentionService = sriRetentionService;
    }

    public List<RetentionTaxCodeResponse> listTaxCodes() {
        return RetentionTaxCatalog.all();
    }

    public List<RetentionResponse> findAll(User user) {
        return retentionRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(RetentionResponse::from)
                .toList();
    }

    public RetentionResponse findById(Long id, User user) {
        return RetentionResponse.from(getOwnedRetention(id, user));
    }

    @Transactional
    public RetentionResponse create(RetentionRequest request, User user) {
        Supplier supplier = supplierService.getOwnedSupplier(request.supplierId(), user);
        SupportDocument support = resolveSupportDocument(request, user, supplier);

        Retention retention = new Retention();
        retention.setUser(user);
        retention.setSupplier(supplier);
        retention.setReceivedDocument(support.receivedDocument());
        retention.setCreatedAt(LocalDateTime.now());
        retention.setSupportDocumentNumber(support.number());
        retention.setSupportDocumentType(support.type());
        retention.setSupportDocumentDate(support.date());
        retention.setPeriodoFiscal(formatPeriodoFiscal(support.date()));

        double total = 0;
        for (RetentionItemRequest lineRequest : request.items()) {
            RetentionTaxCodeResponse taxCode = RetentionTaxCatalog.require(lineRequest.retentionCodeId());
            double taxableBase = resolveTaxableBase(lineRequest.taxableBase(), taxCode, support);
            double retained = SriRetentionService.round(taxableBase * taxCode.percentage() / 100.0);

            RetentionItem item = new RetentionItem();
            item.setRetention(retention);
            item.setTaxType(taxCode.taxType());
            item.setRetentionCode(taxCode.retentionCode());
            item.setRetentionLabel(taxCode.label());
            item.setPercentage(taxCode.percentage());
            item.setTaxableBase(taxableBase);
            item.setRetainedAmount(retained);
            retention.getItems().add(item);
            total += retained;
        }

        retention.setTotalRetained(SriRetentionService.round(total));
        Retention saved = retentionRepository.save(retention);

        if (sriRetentionService.isEnabled()) {
            sriRetentionService.emitRetention(saved);
            saved = retentionRepository.save(saved);
        } else {
            saved.setSriStatus("DISABLED");
            saved = retentionRepository.save(saved);
        }

        return RetentionResponse.from(saved);
    }

    @Transactional
    public RetentionResponse refreshSriStatus(Long id, User user) {
        Retention retention = getOwnedRetention(id, user);
        if (!sriRetentionService.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        sriRetentionService.refreshFromDatil(retention);
        return RetentionResponse.from(retentionRepository.save(retention));
    }

    @Transactional
    public RetentionResponse reissueSri(Long id, User user) {
        Retention retention = getOwnedRetention(id, user);
        sriRetentionService.reissueRetention(retention);
        return RetentionResponse.from(retentionRepository.save(retention));
    }

    private SupportDocument resolveSupportDocument(RetentionRequest request, User user, Supplier supplier) {
        if (request.receivedDocumentId() != null) {
            ReceivedDocument receivedDocument =
                    receivedDocumentService.getOwnedDocument(request.receivedDocumentId(), user);
            if (!receivedDocument.getIssuerTaxId().equals(supplier.getTaxId())) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "El proveedor no coincide con el emisor del documento recibido");
            }
            return new SupportDocument(
                    receivedDocument,
                    receivedDocument.getDocumentNumber(),
                    receivedDocument.getDocumentType(),
                    receivedDocument.getIssueDate());
        }

        if (request.supportDocumentNumber() == null || request.supportDocumentNumber().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ingresa el número del documento de sustento");
        }
        if (request.supportDocumentDate() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ingresa la fecha del documento de sustento");
        }

        String type = request.supportDocumentType() == null || request.supportDocumentType().isBlank()
                ? "01"
                : request.supportDocumentType().trim();
        return new SupportDocument(null, request.supportDocumentNumber().trim(), type, request.supportDocumentDate());
    }

    private record SupportDocument(
            ReceivedDocument receivedDocument, String number, String type, java.time.LocalDate date) {}

    private static String formatPeriodoFiscal(java.time.LocalDate date) {
        return String.format("%02d/%04d", date.getMonthValue(), date.getYear());
    }

    private static double resolveTaxableBase(
            double requestedBase, RetentionTaxCodeResponse taxCode, SupportDocument support) {
        if (support.receivedDocument() == null || support.receivedDocument().getSubtotal() == null) {
            return requestedBase;
        }

        double documentSubtotal = SriRetentionService.round(support.receivedDocument().getSubtotal());
        if ("1".equals(taxCode.taxType()) && "01".equals(support.type())) {
            if (Math.abs(requestedBase - documentSubtotal) > 0.01) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "La base imponible debe coincidir con el subtotal del documento sustento ("
                                + documentSubtotal
                                + ")");
            }
            return documentSubtotal;
        }

        if ("2".equals(taxCode.taxType()) && support.receivedDocument().getIva() != null) {
            double documentIva = SriRetentionService.round(support.receivedDocument().getIva());
            if (Math.abs(requestedBase - documentIva) > 0.01) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "La base imponible de IVA debe coincidir con el IVA del documento sustento ("
                                + documentIva
                                + ")");
            }
            return documentIva;
        }

        return requestedBase;
    }

    private Retention getOwnedRetention(Long id, User user) {
        return retentionRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Retención no encontrada"));
    }
}
