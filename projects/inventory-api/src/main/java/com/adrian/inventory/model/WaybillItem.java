package com.adrian.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "waybill_items")
public class WaybillItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "waybill_id", nullable = false)
    private Waybill waybill;

    private Long productId;

    @Column(nullable = false)
    private String productName;

    private String sku;

    @Column(nullable = false)
    private Integer quantity;

    public WaybillItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Waybill getWaybill() { return waybill; }
    public void setWaybill(Waybill waybill) { this.waybill = waybill; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
