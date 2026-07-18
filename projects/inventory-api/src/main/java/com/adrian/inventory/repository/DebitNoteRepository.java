package com.adrian.inventory.repository;

import com.adrian.inventory.model.DebitNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DebitNoteRepository extends JpaRepository<DebitNote, Long> {
    List<DebitNote> findByUserIdOrderByIdDesc(Long userId);

    Optional<DebitNote> findByIdAndUserId(Long id, Long userId);

    Optional<DebitNote> findFirstByDatilDebitNoteId(String datilDebitNoteId);
}
