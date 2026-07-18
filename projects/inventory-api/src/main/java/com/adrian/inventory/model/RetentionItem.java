package com.adrian.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "retention_items")
public class RetentionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "retention_id", nullable = false)
    private Retention retention;

    @Column(nullable = false, length = 2)
    private String taxType;

    @Column(nullable = false, length = 8)
    private String retentionCode;

    @Column(nullable = false)
    private String retentionLabel;

    private Double percentage;

    private Double taxableBase;

    private Double retainedAmount;

    public RetentionItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Retention getRetention() { return retention; }
    public void setRetention(Retention retention) { this.retention = retention; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }
    public String getRetentionCode() { return retentionCode; }
    public void setRetentionCode(String retentionCode) { this.retentionCode = retentionCode; }
    public String getRetentionLabel() { return retentionLabel; }
    public void setRetentionLabel(String retentionLabel) { this.retentionLabel = retentionLabel; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Double getTaxableBase() { return taxableBase; }
    public void setTaxableBase(Double taxableBase) { this.taxableBase = taxableBase; }
    public Double getRetainedAmount() { return retainedAmount; }
    public void setRetainedAmount(Double retainedAmount) { this.retainedAmount = retainedAmount; }
}
