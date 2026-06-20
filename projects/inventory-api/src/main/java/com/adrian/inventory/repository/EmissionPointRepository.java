package com.adrian.inventory.repository;

import com.adrian.inventory.model.EmissionPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmissionPointRepository extends JpaRepository<EmissionPoint, Long> {
    List<EmissionPoint> findByUserIdOrderByDefaultPointDescLabelAsc(Long userId);

    Optional<EmissionPoint> findByIdAndUserId(Long id, Long userId);

    Optional<EmissionPoint> findByUserIdAndDefaultPointTrue(Long userId);
}
