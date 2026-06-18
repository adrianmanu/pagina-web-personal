package com.adrian.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "billing_sequences")
public class BillingSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String scopeKey = "default";

    @Column(nullable = false)
    private int lastSecuencial = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getScopeKey() { return scopeKey; }
    public void setScopeKey(String scopeKey) { this.scopeKey = scopeKey; }
    public int getLastSecuencial() { return lastSecuencial; }
    public void setLastSecuencial(int lastSecuencial) { this.lastSecuencial = lastSecuencial; }
}
