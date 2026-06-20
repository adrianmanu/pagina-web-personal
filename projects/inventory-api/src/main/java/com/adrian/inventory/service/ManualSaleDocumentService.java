package com.adrian.inventory.service;

import com.adrian.inventory.dto.ManualSaleDocumentRequest;
import com.adrian.inventory.dto.ManualSaleDocumentResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.ManualSaleDocument;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.ManualSaleDocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ManualSaleDocumentService {

    private final ManualSaleDocumentRepository manualSaleDocumentRepository;
    private final com.adrian.inventory.config.DatilProperties datilProperties;

    public ManualSaleDocumentService(
            ManualSaleDocumentRepository manualSaleDocumentRepository,
            com.adrian.inventory.config.DatilProperties datilProperties) {
        this.manualSaleDocumentRepository = manualSaleDocumentRepository;
        this.datilProperties = datilProperties;
    }

    public List<ManualSaleDocumentResponse> findAll(User user) {
        return manualSaleDocumentRepository.findByUserIdOrderByIssueDateDescIdDesc(user.getId()).stream()
                .map(ManualSaleDocumentResponse::from)
                .toList();
    }

    @Transactional
    public ManualSaleDocumentResponse create(ManualSaleDocumentRequest request, User user) {
        AtsTaxHelper.TaxBreakdown tax = request.subtotal() != null
                ? AtsTaxHelper.fromParts(request.subtotal(), request.iva(), request.total())
                : AtsTaxHelper.breakdown(request.total(), datilProperties);

        ManualSaleDocument document = new ManualSaleDocument();
        document.setUser(user);
        document.setCreatedAt(LocalDateTime.now());
        document.setIssueDate(request.issueDate());
        document.setDocumentType(request.documentType().trim());
        document.setDocumentNumber(request.documentNumber().trim());
        document.setCustomerName(request.customerName().trim());
        document.setCustomerTaxId(TaxIdValidator.normalize(request.customerTaxId().trim()));
        document.setCustomerIdType(resolveCustomerIdType(request.customerIdType(), document.getCustomerTaxId()));
        document.setSubtotal(tax.subtotal());
        document.setIva(tax.iva());
        document.setTotal(tax.total());
        document.setNotes(blankToNull(request.notes()));
        return ManualSaleDocumentResponse.from(manualSaleDocumentRepository.save(document));
    }

    @Transactional
    public void delete(Long id, User user) {
        ManualSaleDocument document = manualSaleDocumentRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Nota de venta no encontrada"));
        manualSaleDocumentRepository.delete(document);
    }

    private static String resolveCustomerIdType(String requested, String taxId) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim();
        }
        if (taxId.length() == 10) {
            return "05";
        }
        if (taxId.length() == 13) {
            return "04";
        }
        return "07";
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
