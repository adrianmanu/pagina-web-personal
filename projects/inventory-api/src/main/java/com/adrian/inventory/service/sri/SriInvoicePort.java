package com.adrian.inventory.service.sri;

import com.adrian.inventory.model.Invoice;

public interface SriInvoicePort {

    boolean isEnabled();

    String providerName();

    void emitInvoice(Invoice invoice);

    void refreshFromProvider(Invoice invoice);

    void reissueInvoice(Invoice invoice);
}
