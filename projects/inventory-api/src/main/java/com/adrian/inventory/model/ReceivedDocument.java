package com.adrian.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "received_documents")
public class ReceivedDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, length = 16)
    private String source;

    @Column(nullable = false, length = 2)
    private String documentType;

    @Column(nullable = false, length = 17)
    private String documentNumber;

    @Column(length = 49)
    private String accessKey;

    @Column(length = 64)
    private String authorizationNumber;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private String issuerName;

    @Column(nullable = false, length = 13)
    private String issuerTaxId;

    private Double subtotal;

    private Double iva;

    private Double total;

    @Column(nullable = false, length = 4)
    private String sustentoCode;

    @Column(length = 1000)
    private String notes;

    @Lob
    private String xmlContent;

    public ReceivedDocument() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }
    public String getAuthorizationNumber() { return authorizationNumber; }
    public void setAuthorizationNumber(String authorizationNumber) { this.authorizationNumber = authorizationNumber; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public String getIssuerName() { return issuerName; }
    public void setIssuerName(String issuerName) { this.issuerName = issuerName; }
    public String getIssuerTaxId() { return issuerTaxId; }
    public void setIssuerTaxId(String issuerTaxId) { this.issuerTaxId = issuerTaxId; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    public Double getIva() { return iva; }
    public void setIva(Double iva) { this.iva = iva; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public String getSustentoCode() { return sustentoCode; }
    public void setSustentoCode(String sustentoCode) { this.sustentoCode = sustentoCode; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getXmlContent() { return xmlContent; }
    public void setXmlContent(String xmlContent) { this.xmlContent = xmlContent; }
}
