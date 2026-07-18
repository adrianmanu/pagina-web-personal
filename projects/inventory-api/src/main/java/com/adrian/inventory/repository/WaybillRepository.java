package com.adrian.inventory.repository;

import com.adrian.inventory.model.Waybill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WaybillRepository extends JpaRepository<Waybill, Long> {
    List<Waybill> findByUserIdOrderByIdDesc(Long userId);

    Optional<Waybill> findByIdAndUserId(Long id, Long userId);

    Optional<Waybill> findFirstByDatilWaybillId(String datilWaybillId);
}
