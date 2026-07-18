package com.adrian.inventory.repository;

import com.adrian.inventory.model.ManualSaleDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ManualSaleDocumentRepository extends JpaRepository<ManualSaleDocument, Long> {

    List<ManualSaleDocument> findByUserIdOrderByIssueDateDescIdDesc(Long userId);

    Optional<ManualSaleDocument> findByIdAndUserId(Long id, Long userId);

    List<ManualSaleDocument> findByUserIdAndIssueDateBetweenOrderByIssueDateAscIdAsc(
            Long userId, LocalDate from, LocalDate to);
}
