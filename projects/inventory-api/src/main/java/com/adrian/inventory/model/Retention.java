package com.adrian.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "retentions")
public class Retention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_document_id")
    private ReceivedDocument receivedDocument;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, length = 17)
    private String supportDocumentNumber;

    @Column(nullable = false, length = 2)
    private String supportDocumentType;

    @Column(nullable = false)
    private LocalDate supportDocumentDate;

    @Column(nullable = false, length = 7)
    private String periodoFiscal;

    private Double totalRetained;

    private String sriStatus;
    @Column(length = 49)
    private String sriAccessKey;
    @Column(length = 64)
    private String sriAuthorizationNumber;
    @Column(length = 64)
    private String datilRetentionId;
    @Column(length = 1000)
    private String sriErrorMessage;
    private Integer sriSecuencial;
    @Column(length = 17)
    private String sriDocumentNumber;
    @Column(length = 512)
    private String sriRidePdfUrl;
    @Column(length = 512)
    private String sriXmlUrl;

    @OneToMany(mappedBy = "retention", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RetentionItem> items = new ArrayList<>();

    public Retention() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public ReceivedDocument getReceivedDocument() { return receivedDocument; }
    public void setReceivedDocument(ReceivedDocument receivedDocument) { this.receivedDocument = receivedDocument; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getSupportDocumentNumber() { return supportDocumentNumber; }
    public void setSupportDocumentNumber(String supportDocumentNumber) { this.supportDocumentNumber = supportDocumentNumber; }
    public String getSupportDocumentType() { return supportDocumentType; }
    public void setSupportDocumentType(String supportDocumentType) { this.supportDocumentType = supportDocumentType; }
    public LocalDate getSupportDocumentDate() { return supportDocumentDate; }
    public void setSupportDocumentDate(LocalDate supportDocumentDate) { this.supportDocumentDate = supportDocumentDate; }
    public String getPeriodoFiscal() { return periodoFiscal; }
    public void setPeriodoFiscal(String periodoFiscal) { this.periodoFiscal = periodoFiscal; }
    public Double getTotalRetained() { return totalRetained; }
    public void setTotalRetained(Double totalRetained) { this.totalRetained = totalRetained; }
    public String getSriStatus() { return sriStatus; }
    public void setSriStatus(String sriStatus) { this.sriStatus = sriStatus; }
    public String getSriAccessKey() { return sriAccessKey; }
    public void setSriAccessKey(String sriAccessKey) { this.sriAccessKey = sriAccessKey; }
    public String getSriAuthorizationNumber() { return sriAuthorizationNumber; }
    public void setSriAuthorizationNumber(String sriAuthorizationNumber) { this.sriAuthorizationNumber = sriAuthorizationNumber; }
    public String getDatilRetentionId() { return datilRetentionId; }
    public void setDatilRetentionId(String datilRetentionId) { this.datilRetentionId = datilRetentionId; }
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
    public List<RetentionItem> getItems() { return items; }
    public void setItems(List<RetentionItem> items) { this.items = items; }
}
