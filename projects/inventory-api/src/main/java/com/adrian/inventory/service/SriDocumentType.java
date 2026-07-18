package com.adrian.inventory.service;

public enum SriDocumentType {

    INVOICE("invoice", "invoices"),
    CREDIT_NOTE("credit_note", "credit-notes"),
    DEBIT_NOTE("debit_note", "debit-notes"),
    RETENTION("retention", "retentions"),
    WAYBILL("waybill", "waybills"),
    PURCHASE_SETTLEMENT("purchase_settlement", "purchase-settlements");

    private final String scopeSuffix;
    private final String apiResource;

    SriDocumentType(String scopeSuffix, String apiResource) {
        this.scopeSuffix = scopeSuffix;
        this.apiResource = apiResource;
    }

    public String getScopeSuffix() {
        return scopeSuffix;
    }

    public String getApiResource() {
        return apiResource;
    }
}
