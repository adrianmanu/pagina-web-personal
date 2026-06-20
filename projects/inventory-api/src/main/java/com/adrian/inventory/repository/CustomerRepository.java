package com.adrian.inventory.repository;

import com.adrian.inventory.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByUserIdOrderByNameAsc(Long userId);

    Optional<Customer> findByIdAndUserId(Long id, Long userId);

    Optional<Customer> findByTaxIdAndUserId(String taxId, Long userId);

    List<Customer> findByUserIdAndNameContainingIgnoreCaseOrderByNameAsc(Long userId, String name);

    List<Customer> findByUserIdAndTaxIdContainingOrderByNameAsc(Long userId, String taxId);
}
