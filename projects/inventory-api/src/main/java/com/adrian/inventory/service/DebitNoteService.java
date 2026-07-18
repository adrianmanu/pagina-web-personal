package com.adrian.inventory.service;

import com.adrian.inventory.dto.DebitNoteItemRequest;
import com.adrian.inventory.dto.DebitNoteRequest;
import com.adrian.inventory.dto.DebitNoteResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.DebitNote;
import com.adrian.inventory.model.DebitNoteItem;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.DebitNoteRepository;
import com.adrian.inventory.repository.InvoiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DebitNoteService {

    private final DebitNoteRepository debitNoteRepository;
    private final InvoiceRepository invoiceRepository;
    private final SriDebitNoteService sriDebitNoteService;

    public DebitNoteService(
            DebitNoteRepository debitNoteRepository,
            InvoiceRepository invoiceRepository,
            SriDebitNoteService sriDebitNoteService) {
        this.debitNoteRepository = debitNoteRepository;
        this.invoiceRepository = invoiceRepository;
        this.sriDebitNoteService = sriDebitNoteService;
    }

    public List<DebitNoteResponse> findAll(User user) {
        return debitNoteRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(DebitNoteResponse::from)
                .toList();
    }

    public DebitNoteResponse findById(Long id, User user) {
        return DebitNoteResponse.from(getOwnedDebitNote(id, user));
    }

    @Transactional
    public DebitNoteResponse create(DebitNoteRequest request, User user) {
        Invoice invoice = invoiceRepository
                .findById(request.invoiceId())
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        if (!"AUTORIZADO".equalsIgnoreCase(invoice.getSriStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se puede emitir nota de débito sobre facturas AUTORIZADAS por el SRI");
        }
        if (invoice.getSriDocumentNumber() == null || invoice.getSriDocumentNumber().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La factura no tiene número SRI");
        }

        DebitNote debitNote = new DebitNote();
        debitNote.setUser(user);
        debitNote.setInvoice(invoice);
        debitNote.setCreatedAt(LocalDateTime.now());

        double total = 0;
        for (DebitNoteItemRequest lineRequest : request.items()) {
            DebitNoteItem item = new DebitNoteItem();
            item.setDebitNote(debitNote);
            item.setMotivo(lineRequest.motivo().trim());
            item.setAmount(lineRequest.amount());
            debitNote.getItems().add(item);
            total += lineRequest.amount();
        }

        debitNote.setTotal(Math.round(total * 100.0) / 100.0);
        DebitNote saved = debitNoteRepository.save(debitNote);

        if (sriDebitNoteService.isEnabled()) {
            sriDebitNoteService.emitDebitNote(saved);
            saved = debitNoteRepository.save(saved);
        } else {
            saved.setSriStatus("DISABLED");
            saved = debitNoteRepository.save(saved);
        }

        return DebitNoteResponse.from(saved);
    }

    @Transactional
    public DebitNoteResponse refreshSriStatus(Long id, User user) {
        DebitNote debitNote = getOwnedDebitNote(id, user);
        if (!sriDebitNoteService.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        sriDebitNoteService.refreshFromDatil(debitNote);
        return DebitNoteResponse.from(debitNoteRepository.save(debitNote));
    }

    @Transactional
    public DebitNoteResponse reissueSri(Long id, User user) {
        DebitNote debitNote = getOwnedDebitNote(id, user);
        sriDebitNoteService.reissueDebitNote(debitNote);
        return DebitNoteResponse.from(debitNoteRepository.save(debitNote));
    }

    private DebitNote getOwnedDebitNote(Long id, User user) {
        return debitNoteRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Nota de débito no encontrada"));
    }
}
