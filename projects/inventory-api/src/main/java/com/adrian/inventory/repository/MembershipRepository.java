package com.adrian.inventory.repository;

import com.adrian.inventory.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByUserId(Long userId);

    Optional<Membership> findByStripeCustomerId(String stripeCustomerId);

    Optional<Membership> findByStripeSubscriptionId(String stripeSubscriptionId);
}
