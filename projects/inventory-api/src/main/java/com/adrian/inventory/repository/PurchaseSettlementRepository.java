package com.adrian.inventory.repository;

import com.adrian.inventory.model.PurchaseSettlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseSettlementRepository extends JpaRepository<PurchaseSettlement, Long> {

    List<PurchaseSettlement> findByUserIdOrderByIdDesc(Long userId);

    Optional<PurchaseSettlement> findByIdAndUserId(Long id, Long userId);

    long countBySupplierId(Long supplierId);
}
