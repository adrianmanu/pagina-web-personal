package com.adrian.inventory.repository;

import com.adrian.inventory.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    List<Supplier> findByUserIdOrderByNameAsc(Long userId);

    Optional<Supplier> findByIdAndUserId(Long id, Long userId);

    Optional<Supplier> findByTaxIdAndUserId(String taxId, Long userId);

    List<Supplier> findByUserIdAndNameContainingIgnoreCaseOrderByNameAsc(Long userId, String name);

    List<Supplier> findByUserIdAndTaxIdContainingOrderByNameAsc(Long userId, String taxId);
}
