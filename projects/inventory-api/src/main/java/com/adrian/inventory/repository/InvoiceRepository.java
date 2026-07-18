package com.adrian.inventory.repository;

import com.adrian.inventory.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUserIdOrderByIdDesc(Long userId);

    long countByUserId(Long userId);

    List<Invoice> findByCustomerIdOrderByIdDesc(Long customerId);

    long countByCustomerId(Long customerId);

    Optional<Invoice> findFirstByDatilInvoiceId(String datilInvoiceId);
}
