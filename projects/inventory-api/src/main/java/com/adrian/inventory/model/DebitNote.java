package com.adrian.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "debit_notes")
public class DebitNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private Double total;

    private String sriStatus;
    @Column(length = 49)
    private String sriAccessKey;
    @Column(length = 64)
    private String sriAuthorizationNumber;
    @Column(length = 64)
    private String datilDebitNoteId;
    @Column(length = 1000)
    private String sriErrorMessage;
    private Integer sriSecuencial;
    @Column(length = 17)
    private String sriDocumentNumber;
    @Column(length = 512)
    private String sriRidePdfUrl;
    @Column(length = 512)
    private String sriXmlUrl;

    @OneToMany(mappedBy = "debitNote", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DebitNoteItem> items = new ArrayList<>();

    public DebitNote() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }
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
    public String getDatilDebitNoteId() { return datilDebitNoteId; }
    public void setDatilDebitNoteId(String datilDebitNoteId) { this.datilDebitNoteId = datilDebitNoteId; }
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
    public List<DebitNoteItem> getItems() { return items; }
    public void setItems(List<DebitNoteItem> items) { this.items = items; }
}
