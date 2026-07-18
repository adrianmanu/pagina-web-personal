package com.adrian.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_settlements")
public class PurchaseSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private Double total;

    private String sriStatus;
    @Column(length = 49)
    private String sriAccessKey;
    @Column(length = 64)
    private String sriAuthorizationNumber;
    @Column(length = 64)
    private String datilPurchaseSettlementId;
    @Column(length = 1000)
    private String sriErrorMessage;
    private Integer sriSecuencial;
    @Column(length = 17)
    private String sriDocumentNumber;
    @Column(length = 512)
    private String sriRidePdfUrl;
    @Column(length = 512)
    private String sriXmlUrl;

    @OneToMany(mappedBy = "purchaseSettlement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseSettlementItem> items = new ArrayList<>();

    public PurchaseSettlement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public String getSriStatus() { return sriStatus; }
    public void setSriStatus(String sriStatus) { this.sriStatus = sriStatus; }
    public String getSriAccessKey() { return sriAccessKey; }
    public void setSriAccessKey(String sriAccessKey) { this.sriAccessKey = sriAccessKey; }
    public String getSriAuthorizationNumber() { return sriAuthorizationNumber; }
    public void setSriAuthorizationNumber(String sriAuthorizationNumber) { this.sriAuthorizationNumber = sriAuthorizationNumber; }
    public String getDatilPurchaseSettlementId() { return datilPurchaseSettlementId; }
    public void setDatilPurchaseSettlementId(String datilPurchaseSettlementId) { this.datilPurchaseSettlementId = datilPurchaseSettlementId; }
    public String getSriErrorMessage() { return sriErrorMessage; }
    public void setSriErrorMessage(String sriErrorMessage) { this.sriErrorMessage = sriErrorMessage; }
    public Integer getSriSecuencial() { return sriSecuencial; }
    public void setSriSecuencial(Integer sriSecuencial) { this.sriSecuencial = sriSecuencial; }
    public String getSriDocumentNumber() { return sriDocumentNumber; }
    public void setSriDocumentNumber(String sriDocumentNumber) { this.sriDocumentNumber = sriDocumentNumber; }
    public String getSriRidePdfUrl() { return sriRidePdfUrl; }
    public void setSriRidePdfUrl(String sriRidePdfUrl) { this.sriRidePdfUrl = sriRidePdfUrl; }
    public String getSriXmlUrl() { return sriXmlUrl; }
    public void setSriXmlUrl(String sriXmlUrl) { this.sriXmlUrl = sriXmlUrl; }
    public List<PurchaseSettlementItem> getItems() { return items; }
    public void setItems(List<PurchaseSettlementItem> items) { this.items = items; }
}
