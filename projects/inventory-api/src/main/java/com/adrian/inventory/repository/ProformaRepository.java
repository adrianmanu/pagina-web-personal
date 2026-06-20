package com.adrian.inventory.repository;

import com.adrian.inventory.model.Proforma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProformaRepository extends JpaRepository<Proforma, Long> {
    List<Proforma> findByUserIdOrderByIdDesc(Long userId);

    Optional<Proforma> findByIdAndUserId(Long id, Long userId);
}
