package com.adrian.inventory.repository;

import com.adrian.inventory.model.CreditNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreditNoteRepository extends JpaRepository<CreditNote, Long> {
    List<CreditNote> findByUserIdOrderByIdDesc(Long userId);

    List<CreditNote> findByInvoiceId(Long invoiceId);

    Optional<CreditNote> findByIdAndUserId(Long id, Long userId);

    Optional<CreditNote> findFirstByDatilCreditNoteId(String datilCreditNoteId);
}
