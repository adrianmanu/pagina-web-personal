package com.adrian.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "proforma_items")
public class ProformaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proforma_id", nullable = false)
    private Proforma proforma;

    private Long productId;
    private String productName;
    private String sku;
    private Integer quantity;
    private Double unitPrice;

    public ProformaItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Proforma getProforma() { return proforma; }
    public void setProforma(Proforma proforma) { this.proforma = proforma; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
}
