package com.adrian.inventory.service;

import com.adrian.inventory.dto.CreditNoteItemRequest;
import com.adrian.inventory.dto.CreditNoteRequest;
import com.adrian.inventory.dto.CreditNoteResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.CreditNote;
import com.adrian.inventory.model.CreditNoteItem;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.InvoiceItem;
import com.adrian.inventory.model.Product;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.CreditNoteRepository;
import com.adrian.inventory.repository.InvoiceRepository;
import com.adrian.inventory.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CreditNoteService {

    private final CreditNoteRepository creditNoteRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final SriCreditNoteService sriCreditNoteService;

    public CreditNoteService(
            CreditNoteRepository creditNoteRepository,
            InvoiceRepository invoiceRepository,
            ProductRepository productRepository,
            SriCreditNoteService sriCreditNoteService) {
        this.creditNoteRepository = creditNoteRepository;
        this.invoiceRepository = invoiceRepository;
        this.productRepository = productRepository;
        this.sriCreditNoteService = sriCreditNoteService;
    }

    public List<CreditNoteResponse> findAll(User user) {
        return creditNoteRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(CreditNoteResponse::from)
                .toList();
    }

    public CreditNoteResponse findById(Long id, User user) {
        return CreditNoteResponse.from(getOwnedCreditNote(id, user));
    }

    @Transactional
    public CreditNoteResponse create(CreditNoteRequest request, User user) {
        Invoice invoice = invoiceRepository
                .findById(request.invoiceId())
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        if (!"AUTORIZADO".equalsIgnoreCase(invoice.getSriStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se puede emitir nota de crédito sobre facturas AUTORIZADAS por el SRI");
        }
        if (invoice.getSriDocumentNumber() == null || invoice.getSriDocumentNumber().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura no tiene número SRI");
        }
        if (invoice.isFinalConsumer()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "El SRI no permite notas de crédito sobre facturas emitidas a consumidor final");
        }

        Map<Long, Integer> creditedByItem = creditedQuantities(invoice.getId());
        List<CreditNoteItemRequest> lineRequests = resolveLineRequests(request, invoice);

        CreditNote creditNote = new CreditNote();
        creditNote.setUser(user);
        creditNote.setInvoice(invoice);
        creditNote.setMotivo(request.motivo().trim());
        creditNote.setRestockStock(request.restockStock());
        creditNote.setCreatedAt(LocalDateTime.now());

        double total = 0;
        for (CreditNoteItemRequest lineRequest : lineRequests) {
            InvoiceItem invoiceItem = invoice.getItems().stream()
                    .filter(item -> item.getId().equals(lineRequest.invoiceItemId()))
                    .findFirst()
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Ítem de factura no válido"));

            int alreadyCredited = creditedByItem.getOrDefault(invoiceItem.getId(), 0);
            int available = (invoiceItem.getQuantity() == null ? 0 : invoiceItem.getQuantity()) - alreadyCredited;
            if (lineRequest.quantity() > available) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Cantidad excede lo disponible para devolver en "
                                + invoiceItem.getProductName()
                                + " (disponible: "
                                + available
                                + ")");
            }

            CreditNoteItem item = new CreditNoteItem();
            item.setCreditNote(creditNote);
            item.setInvoiceItemId(invoiceItem.getId());
            item.setProductId(invoiceItem.getProductId());
            item.setProductName(invoiceItem.getProductName());
            item.setSku(invoiceItem.getSku());
            item.setQuantity(lineRequest.quantity());
            item.setUnitPrice(invoiceItem.getUnitPrice());
            creditNote.getItems().add(item);

            total += lineRequest.quantity() * (invoiceItem.getUnitPrice() == null ? 0 : invoiceItem.getUnitPrice());
        }

        creditNote.setTotal(Math.round(total * 100.0) / 100.0);
        CreditNote saved = creditNoteRepository.save(creditNote);

        boolean sriEnabled = sriCreditNoteService.isEnabled();
        if (sriEnabled) {
            sriCreditNoteService.emitCreditNote(saved);
            saved = creditNoteRepository.save(saved);
        } else {
            saved.setSriStatus("DISABLED");
            saved = creditNoteRepository.save(saved);
        }

        if (request.restockStock() && shouldRestock(saved.getSriStatus(), sriEnabled)) {
            applyRestock(saved, user);
            saved = creditNoteRepository.save(saved);
        }

        return CreditNoteResponse.from(saved);
    }

    @Transactional
    public CreditNoteResponse refreshSriStatus(Long id, User user) {
        CreditNote creditNote = getOwnedCreditNote(id, user);
        if (!sriCreditNoteService.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        sriCreditNoteService.refreshFromDatil(creditNote);
        CreditNote saved = creditNoteRepository.save(creditNote);
        if (saved.isRestockStock() && shouldRestock(saved.getSriStatus(), true)) {
            applyRestock(saved, user);
            saved = creditNoteRepository.save(saved);
        }
        return CreditNoteResponse.from(saved);
    }

    private List<CreditNoteItemRequest> resolveLineRequests(CreditNoteRequest request, Invoice invoice) {
        if (request.fullCredit()) {
            return invoice.getItems().stream()
                    .map(item -> new CreditNoteItemRequest(item.getId(), item.getQuantity()))
                    .toList();
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Indica los ítems a acreditar o marca nota total");
        }
        return request.items();
    }

    private Map<Long, Integer> creditedQuantities(Long invoiceId) {
        Map<Long, Integer> credited = new HashMap<>();
        for (CreditNote note : creditNoteRepository.findByInvoiceId(invoiceId)) {
            if ("ERROR".equalsIgnoreCase(note.getSriStatus())) {
                continue;
            }
            for (CreditNoteItem item : note.getItems()) {
                credited.merge(item.getInvoiceItemId(), item.getQuantity(), Integer::sum);
            }
        }
        return credited;
    }

    private void restockProduct(Product product, int quantity) {
        int current = product.getStock() == null ? 0 : product.getStock();
        product.setStock(current + quantity);
        productRepository.save(product);
    }

    private void applyRestock(CreditNote creditNote, User user) {
        if (creditNote.isStockRestocked()) {
            return;
        }
        for (CreditNoteItem item : creditNote.getItems()) {
            if (item.getProductId() != null) {
                productRepository
                        .findByIdAndUserId(item.getProductId(), user.getId())
                        .ifPresent(product -> restockProduct(product, item.getQuantity()));
            }
        }
        creditNote.setStockRestocked(true);
    }

    private static boolean shouldRestock(String sriStatus, boolean sriEnabled) {
        if (!sriEnabled) {
            return true;
        }
        return sriStatus != null && "AUTORIZADO".equalsIgnoreCase(sriStatus);
    }

    private CreditNote getOwnedCreditNote(Long id, User user) {
        return creditNoteRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Nota de crédito no encontrada"));
    }
}
