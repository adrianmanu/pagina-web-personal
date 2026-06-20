package com.adrian.inventory.repository;

import com.adrian.inventory.model.MembershipPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MembershipPaymentRepository extends JpaRepository<MembershipPayment, Long> {

    Optional<MembershipPayment> findByClientTransactionId(String clientTransactionId);
}
