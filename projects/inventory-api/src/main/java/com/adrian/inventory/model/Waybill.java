package com.adrian.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "waybills")
public class Waybill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String direccionPartida;

    @Column(nullable = false)
    private String motivoTraslado;

    private String ruta;

    @Column(nullable = false)
    private String carrierName;

    @Column(nullable = false)
    private String carrierTaxId;

    @Column(nullable = false)
    private String carrierPlate;

    private String carrierEmail;
    private String carrierAddress;
    private String carrierPhone;

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String recipientTaxId;

    private String recipientEmail;
    @Column(nullable = false)
    private String recipientAddress;
    private String recipientPhone;

    private String sriStatus;
    @Column(length = 49)
    private String sriAccessKey;
    @Column(length = 64)
    private String sriAuthorizationNumber;
    @Column(length = 64)
    private String datilWaybillId;
    @Column(length = 1000)
    private String sriErrorMessage;
    private Integer sriSecuencial;
    @Column(length = 17)
    private String sriDocumentNumber;
    @Column(length = 512)
    private String sriRidePdfUrl;
    @Column(length = 512)
    private String sriXmlUrl;

    @OneToMany(mappedBy = "waybill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WaybillItem> items = new ArrayList<>();

    public Waybill() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getDireccionPartida() { return direccionPartida; }
    public void setDireccionPartida(String direccionPartida) { this.direccionPartida = direccionPartida; }
    public String getMotivoTraslado() { return motivoTraslado; }
    public void setMotivoTraslado(String motivoTraslado) { this.motivoTraslado = motivoTraslado; }
    public String getRuta() { return ruta; }
    public void setRuta(String ruta) { this.ruta = ruta; }
    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }
    public String getCarrierTaxId() { return carrierTaxId; }
    public void setCarrierTaxId(String carrierTaxId) { this.carrierTaxId = carrierTaxId; }
    public String getCarrierPlate() { return carrierPlate; }
    public void setCarrierPlate(String carrierPlate) { this.carrierPlate = carrierPlate; }
    public String getCarrierEmail() { return carrierEmail; }
    public void setCarrierEmail(String carrierEmail) { this.carrierEmail = carrierEmail; }
    public String getCarrierAddress() { return carrierAddress; }
    public void setCarrierAddress(String carrierAddress) { this.carrierAddress = carrierAddress; }
    public String getCarrierPhone() { return carrierPhone; }
    public void setCarrierPhone(String carrierPhone) { this.carrierPhone = carrierPhone; }
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getRecipientTaxId() { return recipientTaxId; }
    public void setRecipientTaxId(String recipientTaxId) { this.recipientTaxId = recipientTaxId; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getRecipientAddress() { return recipientAddress; }
    public void setRecipientAddress(String recipientAddress) { this.recipientAddress = recipientAddress; }
    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }
    public String getSriStatus() { return sriStatus; }
    public void setSriStatus(String sriStatus) { this.sriStatus = sriStatus; }
    public String getSriAccessKey() { return sriAccessKey; }
    public void setSriAccessKey(String sriAccessKey) { this.sriAccessKey = sriAccessKey; }
    public String getSriAuthorizationNumber() { return sriAuthorizationNumber; }
    public void setSriAuthorizationNumber(String sriAuthorizationNumber) { this.sriAuthorizationNumber = sriAuthorizationNumber; }
    public String getDatilWaybillId() { return datilWaybillId; }
    public void setDatilWaybillId(String datilWaybillId) { this.datilWaybillId = datilWaybillId; }
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
    public List<WaybillItem> getItems() { return items; }
    public void setItems(List<WaybillItem> items) { this.items = items; }
}
