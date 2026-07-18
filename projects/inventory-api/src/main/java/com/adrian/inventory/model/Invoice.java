package com.adrian.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false)
    private boolean finalConsumer;

    @Column(nullable = false)
    private String customerName;

    private String customerTaxId;
    private String customerEmail;
    private String customerAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private Double total;

    private String sriStatus;
    @Column(length = 49)
    private String sriAccessKey;
    @Column(length = 64)
    private String sriAuthorizationNumber;
    @Column(length = 64)
    private String datilInvoiceId;
    @Column(length = 1000)
    private String sriErrorMessage;
    private Integer sriSecuencial;
    @Column(length = 17)
    private String sriDocumentNumber;
    @Column(length = 512)
    private String sriRidePdfUrl;
    @Column(length = 512)
    private String sriXmlUrl;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items = new ArrayList<>();

    public Invoice() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public boolean isFinalConsumer() { return finalConsumer; }
    public void setFinalConsumer(boolean finalConsumer) { this.finalConsumer = finalConsumer; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerTaxId() { return customerTaxId; }
    public void setCustomerTaxId(String customerTaxId) { this.customerTaxId = customerTaxId; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }
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
    public String getDatilInvoiceId() { return datilInvoiceId; }
    public void setDatilInvoiceId(String datilInvoiceId) { this.datilInvoiceId = datilInvoiceId; }
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
    public List<InvoiceItem> getItems() { return items; }
    public void setItems(List<InvoiceItem> items) { this.items = items; }
}
