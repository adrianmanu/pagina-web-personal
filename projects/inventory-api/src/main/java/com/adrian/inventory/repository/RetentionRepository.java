package com.adrian.inventory.repository;

import com.adrian.inventory.model.Retention;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RetentionRepository extends JpaRepository<Retention, Long> {

    List<Retention> findByUserIdOrderByIdDesc(Long userId);

    Optional<Retention> findByIdAndUserId(Long id, Long userId);

    Optional<Retention> findFirstByDatilRetentionId(String datilRetentionId);
}
