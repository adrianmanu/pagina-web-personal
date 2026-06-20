package com.adrian.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "debit_note_items")
public class DebitNoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "debit_note_id", nullable = false)
    private DebitNote debitNote;

    @Column(nullable = false)
    private String motivo;

    private Double amount;

    public DebitNoteItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DebitNote getDebitNote() { return debitNote; }
    public void setDebitNote(DebitNote debitNote) { this.debitNote = debitNote; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}
