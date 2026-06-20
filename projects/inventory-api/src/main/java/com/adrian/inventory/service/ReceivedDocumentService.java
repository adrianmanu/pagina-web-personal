package com.adrian.inventory.service;

import com.adrian.inventory.dto.ReceivedDocumentRequest;
import com.adrian.inventory.dto.ReceivedDocumentResponse;
import com.adrian.inventory.dto.ReceivedDocumentUploadRequest;
import com.adrian.inventory.dto.SustentoCodeResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.ReceivedDocument;
import com.adrian.inventory.model.Supplier;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.ReceivedDocumentRepository;
import com.adrian.inventory.repository.SupplierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReceivedDocumentService {

    private final ReceivedDocumentRepository receivedDocumentRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierService supplierService;

    public ReceivedDocumentService(
            ReceivedDocumentRepository receivedDocumentRepository,
            SupplierRepository supplierRepository,
            SupplierService supplierService) {
        this.receivedDocumentRepository = receivedDocumentRepository;
        this.supplierRepository = supplierRepository;
        this.supplierService = supplierService;
    }

    public List<SustentoCodeResponse> listSustentoCodes() {
        return SustentoCatalog.all();
    }

    public List<ReceivedDocumentResponse> search(
            User user,
            String query,
            String documentType,
            String issuerTaxId,
            LocalDate fromDate,
            LocalDate toDate) {
        String normalizedIssuer = issuerTaxId == null || issuerTaxId.isBlank()
                ? null
                : TaxIdValidator.normalize(issuerTaxId.trim());

        return receivedDocumentRepository
                .search(user.getId(), blankToNull(query), blankToNull(documentType), normalizedIssuer, fromDate, toDate)
                .stream()
                .map(ReceivedDocumentResponse::from)
                .toList();
    }

    public ReceivedDocumentResponse findById(Long id, User user) {
        return ReceivedDocumentResponse.from(getOwnedDocument(id, user));
    }

    @Transactional
    public ReceivedDocumentResponse createManual(ReceivedDocumentRequest request, User user) {
        ensureUniqueAccessKey(user.getId(), request.accessKey(), null);

        ReceivedDocument document = new ReceivedDocument();
        document.setUser(user);
        document.setCreatedAt(LocalDateTime.now());
        document.setSource("MANUAL");
        applyManualRequest(document, request, user);
        return ReceivedDocumentResponse.from(receivedDocumentRepository.save(document));
    }

    @Transactional
    public ReceivedDocumentResponse uploadXml(ReceivedDocumentUploadRequest request, User user) {
        ReceivedDocumentXmlParser.ParsedReceivedDocument parsed = ReceivedDocumentXmlParser.parse(request.xml());
        ensureUniqueAccessKey(user.getId(), parsed.accessKey(), null);

        ReceivedDocument document = new ReceivedDocument();
        document.setUser(user);
        document.setCreatedAt(LocalDateTime.now());
        document.setSource("XML_UPLOAD");
        document.setXmlContent(request.xml().trim());
        document.setDocumentType(parsed.documentType());
        document.setDocumentNumber(parsed.documentNumber());
        document.setAccessKey(parsed.accessKey());
        document.setAuthorizationNumber(parsed.authorizationNumber());
        document.setIssueDate(parsed.issueDate());
        document.setIssuerName(parsed.issuerName());
        document.setIssuerTaxId(parsed.issuerTaxId());
        document.setSubtotal(parsed.subtotal());
        document.setIva(parsed.iva());
        document.setTotal(parsed.total());
        document.setSustentoCode(resolveSustentoCode(request.sustentoCode(), parsed.documentType()));
        document.setNotes(blankToNull(request.notes()));
        document.setSupplier(resolveSupplier(user, parsed.issuerTaxId(), null));

        return ReceivedDocumentResponse.from(receivedDocumentRepository.save(document));
    }

    @Transactional
    public void delete(Long id, User user) {
        receivedDocumentRepository.delete(getOwnedDocument(id, user));
    }

    public ReceivedDocument getOwnedDocument(Long id, User user) {
        return receivedDocumentRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Documento recibido no encontrado"));
    }

    private void applyManualRequest(ReceivedDocument document, ReceivedDocumentRequest request, User user) {
        String issuerTaxId = TaxIdValidator.normalize(request.issuerTaxId().trim());
        document.setDocumentType(request.documentType().trim());
        document.setDocumentNumber(request.documentNumber().trim());
        document.setAccessKey(blankToNull(request.accessKey()));
        document.setAuthorizationNumber(blankToNull(request.authorizationNumber()));
        document.setIssueDate(request.issueDate());
        document.setIssuerName(request.issuerName().trim());
        document.setIssuerTaxId(issuerTaxId);
        document.setSubtotal(request.subtotal());
        document.setIva(request.iva());
        document.setTotal(request.total());
        document.setSustentoCode(request.sustentoCode().trim());
        document.setNotes(blankToNull(request.notes()));

        if (request.supplierId() != null) {
            Supplier supplier = supplierService.getOwnedSupplier(request.supplierId(), user);
            if (!supplier.getTaxId().equals(issuerTaxId)) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "El proveedor seleccionado no coincide con la identificación del emisor");
            }
            document.setSupplier(supplier);
        } else {
            document.setSupplier(resolveSupplier(user, issuerTaxId, null));
        }
    }

    private Supplier resolveSupplier(User user, String issuerTaxId, Long preferredSupplierId) {
        if (preferredSupplierId != null) {
            return supplierService.getOwnedSupplier(preferredSupplierId, user);
        }
        return supplierRepository.findByTaxIdAndUserId(issuerTaxId, user.getId()).orElse(null);
    }

    private String resolveSustentoCode(String requested, String documentType) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim();
        }
        return "01".equals(documentType) ? "01" : "03";
    }

    private void ensureUniqueAccessKey(Long userId, String accessKey, Long currentId) {
        if (accessKey == null || accessKey.isBlank()) {
            return;
        }
        receivedDocumentRepository.findByUserIdAndAccessKey(userId, accessKey.trim()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Ya existe un documento con esa clave de acceso");
            }
        });
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
