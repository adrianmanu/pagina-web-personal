package com.adrian.inventory.repository;

import com.adrian.inventory.model.ReceivedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReceivedDocumentRepository extends JpaRepository<ReceivedDocument, Long> {

    List<ReceivedDocument> findByUserIdOrderByIssueDateDescIdDesc(Long userId);

    Optional<ReceivedDocument> findByIdAndUserId(Long id, Long userId);

    Optional<ReceivedDocument> findByUserIdAndAccessKey(Long userId, String accessKey);

    @Query("""
            SELECT d FROM ReceivedDocument d
            WHERE d.user.id = :userId
              AND (:documentType IS NULL OR d.documentType = :documentType)
              AND (:issuerTaxId IS NULL OR d.issuerTaxId LIKE CONCAT('%', :issuerTaxId, '%'))
              AND (:fromDate IS NULL OR d.issueDate >= :fromDate)
              AND (:toDate IS NULL OR d.issueDate <= :toDate)
              AND (
                    :query IS NULL OR :query = '' OR
                    LOWER(d.issuerName) LIKE LOWER(CONCAT('%', :query, '%')) OR
                    d.documentNumber LIKE CONCAT('%', :query, '%') OR
                    d.accessKey LIKE CONCAT('%', :query, '%')
              )
            ORDER BY d.issueDate DESC, d.id DESC
            """)
    List<ReceivedDocument> search(
            @Param("userId") Long userId,
            @Param("query") String query,
            @Param("documentType") String documentType,
            @Param("issuerTaxId") String issuerTaxId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}
