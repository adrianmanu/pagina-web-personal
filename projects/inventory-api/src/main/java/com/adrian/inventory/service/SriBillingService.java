package com.adrian.inventory.service;

import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.service.sri.SriInvoicePort;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SriBillingService {

    private final SriInvoicePort invoicePort;

    public SriBillingService(@Qualifier("sriInvoicePort") SriInvoicePort invoicePort) {
        this.invoicePort = invoicePort;
    }

    public boolean isEnabled() {
        return invoicePort.isEnabled();
    }

    public String providerName() {
        return invoicePort.providerName();
    }

    @Transactional
    public void emitInvoice(Invoice invoice) {
        invoicePort.emitInvoice(invoice);
    }

    public void refreshFromProvider(Invoice invoice) {
        invoicePort.refreshFromProvider(invoice);
    }

    @Transactional
    public void reissueInvoice(Invoice invoice) {
        invoicePort.reissueInvoice(invoice);
    }

    /** @deprecated use {@link #refreshFromProvider(Invoice)} */
    public void refreshFromDatil(Invoice invoice) {
        refreshFromProvider(invoice);
    }

    public static boolean canReissue(String status) {
        if (status == null) return false;
        String normalized = status.toUpperCase();
        return "ERROR".equals(normalized)
                || "NO AUTORIZADO".equals(normalized)
                || "DEVUELTO".equals(normalized);
    }
}
