package com.adrian.inventory.repository;

import com.adrian.inventory.model.BillingSequence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BillingSequenceRepository extends JpaRepository<BillingSequence, Long> {
    Optional<BillingSequence> findByScopeKey(String scopeKey);
}
