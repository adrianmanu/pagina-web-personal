package com.adrian.inventory.service;

import com.adrian.inventory.dto.InvoiceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class InvoiceNotificationService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceNotificationService.class);

    public void notifyInvoice(InvoiceResponse invoice) {
        if (invoice.customerEmail() == null || invoice.customerEmail().isBlank()) {
            log.info("Factura #{} sin email de cliente; no se envía notificación", invoice.id());
            return;
        }
        String pdfUrl = invoice.sriRidePdfUrl();
        if (pdfUrl == null && invoice.datilInvoiceId() != null) {
            pdfUrl = "https://app.datil.co/ver/" + invoice.datilInvoiceId() + "/pdf";
        }
        log.info(
                "Notificación factura #{} → {} | PDF: {}",
                invoice.sriDocumentNumber() == null ? invoice.id() : invoice.sriDocumentNumber(),
                invoice.customerEmail(),
                pdfUrl == null ? "pendiente" : pdfUrl);
    }
}
