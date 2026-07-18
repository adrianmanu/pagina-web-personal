package com.adrian.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "manual_sale_documents")
public class ManualSaleDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false, length = 2)
    private String documentType;

    @Column(nullable = false, length = 17)
    private String documentNumber;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false, length = 13)
    private String customerTaxId;

    @Column(nullable = false, length = 2)
    private String customerIdType;

    private Double subtotal;

    private Double iva;

    private Double total;

    @Column(length = 500)
    private String notes;

    public ManualSaleDocument() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerTaxId() { return customerTaxId; }
    public void setCustomerTaxId(String customerTaxId) { this.customerTaxId = customerTaxId; }
    public String getCustomerIdType() { return customerIdType; }
    public void setCustomerIdType(String customerIdType) { this.customerIdType = customerIdType; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    public Double getIva() { return iva; }
    public void setIva(Double iva) { this.iva = iva; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
