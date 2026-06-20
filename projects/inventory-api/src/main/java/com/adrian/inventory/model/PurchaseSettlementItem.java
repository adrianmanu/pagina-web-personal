package com.adrian.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "purchase_settlement_items")
public class PurchaseSettlementItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_settlement_id", nullable = false)
    private PurchaseSettlement purchaseSettlement;

    private Long productId;

    @Column(nullable = false)
    private String description;

    private String sku;

    private Integer quantity;

    private Double unitPrice;

    private Double subtotal;

    public PurchaseSettlementItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PurchaseSettlement getPurchaseSettlement() { return purchaseSettlement; }
    public void setPurchaseSettlement(PurchaseSettlement purchaseSettlement) { this.purchaseSettlement = purchaseSettlement; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}
