package com.adrian.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "membership_payments")
public class MembershipPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private MembershipPlan plan;

    @Column(nullable = false, unique = true, length = 12)
    private String clientTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private MembershipPaymentStatus status = MembershipPaymentStatus.PENDING;

    private Long payphoneTransactionId;

    @Column(nullable = false)
    private int amountCents;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime confirmedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public MembershipPlan getPlan() {
        return plan;
    }

    public void setPlan(MembershipPlan plan) {
        this.plan = plan;
    }

    public String getClientTransactionId() {
        return clientTransactionId;
    }

    public void setClientTransactionId(String clientTransactionId) {
        this.clientTransactionId = clientTransactionId;
    }

    public MembershipPaymentStatus getStatus() {
        return status;
    }

    public void setStatus(MembershipPaymentStatus status) {
        this.status = status;
    }

    public Long getPayphoneTransactionId() {
        return payphoneTransactionId;
    }

    public void setPayphoneTransactionId(Long payphoneTransactionId) {
        this.payphoneTransactionId = payphoneTransactionId;
    }

    public int getAmountCents() {
        return amountCents;
    }

    public void setAmountCents(int amountCents) {
        this.amountCents = amountCents;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }
}
