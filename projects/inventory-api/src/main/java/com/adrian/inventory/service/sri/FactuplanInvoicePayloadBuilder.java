package com.adrian.inventory.service.sri;

import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.InvoiceItem;
import com.adrian.inventory.service.TaxIdValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class FactuplanInvoicePayloadBuilder {

    private final ObjectMapper objectMapper;

    public FactuplanInvoicePayloadBuilder(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ObjectNode build(Invoice invoice, SriEmitterContext emitter) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("establishment", emitter.establecimientoCodigo());
        root.put("emissionPoint", emitter.puntoEmision());
        root.put("sendEmail", invoice.getCustomerEmail() != null && !invoice.getCustomerEmail().isBlank());

        ObjectNode customer = root.putObject("customer");
        if (invoice.isFinalConsumer()) {
            customer.put("identificationType", "FINAL_CONSUMER");
            customer.put("identification", "9999999999999");
            customer.put("legalName", "CONSUMIDOR FINAL");
            customer.put("email", "consumidorfinal@facturacion.ec");
        } else {
            customer.put("identificationType", resolveIdentificationType(invoice.getCustomerTaxId()));
            customer.put("identification", TaxIdValidator.normalize(invoice.getCustomerTaxId()));
            customer.put("legalName", invoice.getCustomerName());
            if (invoice.getCustomerEmail() != null) {
                customer.put("email", invoice.getCustomerEmail());
            }
            if (invoice.getCustomerAddress() != null) {
                customer.put("address", invoice.getCustomerAddress());
            }
            customer.put("saveToContacts", true);
        }

        ArrayNode items = root.putArray("items");
        double totalWithTax = 0;
        for (InvoiceItem item : invoice.getItems()) {
            LineTax lineTax = calculateLineTax(item, emitter);
            totalWithTax += lineTax.totalWithTax();
            ObjectNode line = items.addObject();
            line.put("code", blankTo(item.getSku(), "ITEM-" + item.getProductId()));
            line.put("description", item.getProductName());
            line.put("quantity", item.getQuantity());
            line.put("unitPrice", lineTax.unitPriceForFactuplan());
            line.put("discount", 0);
            line.put("taxType", "IVA_RATE");
            line.put("tax", (int) Math.round(emitter.ivaRate()));
        }

        ArrayNode payments = root.putArray("payments");
        ObjectNode payment = payments.addObject();
        payment.put("method", "01");
        payment.put("amount", round(totalWithTax));

        return root;
    }

    private String resolveIdentificationType(String taxId) {
        String normalized = TaxIdValidator.normalize(taxId);
        if (normalized.length() == 13) {
            return "RUC";
        }
        if (normalized.length() == 10) {
            return "CEDULA";
        }
        return "RUC";
    }

    private LineTax calculateLineTax(InvoiceItem item, SriEmitterContext emitter) {
        double quantity = item.getQuantity() == null ? 0 : item.getQuantity();
        double unitPrice = item.getUnitPrice() == null ? 0 : item.getUnitPrice();
        double lineTotal = round(quantity * unitPrice);

        if (emitter.pricesIncludeIva()) {
            double unit = quantity > 0 ? round(lineTotal / quantity) : 0;
            return new LineTax(unit, lineTotal);
        }
        double taxAmount = round(lineTotal * (emitter.ivaRate() / 100.0));
        return new LineTax(unitPrice, round(lineTotal + taxAmount));
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private record LineTax(double unitPriceForFactuplan, double totalWithTax) {}
}
