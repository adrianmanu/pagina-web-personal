package com.adrian.inventory.repository;

import com.adrian.inventory.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUserIdOrderByIdDesc(Long userId);
}
