package com.adrian.inventory.service.sri;

import com.adrian.inventory.model.CreditNote;
import com.adrian.inventory.model.CreditNoteItem;
import com.adrian.inventory.model.DebitNote;
import com.adrian.inventory.model.DebitNoteItem;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.Retention;
import com.adrian.inventory.model.RetentionItem;
import com.adrian.inventory.model.Waybill;
import com.adrian.inventory.model.WaybillItem;
import com.adrian.inventory.service.TaxIdValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;

@Component
public class FactuplanPayloadBuilders {

    private static final DateTimeFormatter WAYBILL_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ObjectMapper objectMapper;

    public FactuplanPayloadBuilders(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ObjectNode creditNote(CreditNote creditNote, String invoiceAccessKey, SriEmitterContext emitter) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("invoiceAccessKey", invoiceAccessKey);
        root.put("reason", creditNote.getMotivo());

        ArrayNode items = root.putArray("items");
        for (CreditNoteItem item : creditNote.getItems()) {
            LineTax lineTax = lineTaxFromCreditItem(item, emitter);
            ObjectNode line = items.addObject();
            line.put("code", blankTo(item.getSku(), "ITEM-" + item.getProductId()));
            line.put("description", item.getProductName());
            line.put("quantity", item.getQuantity());
            line.put("unitPrice", lineTax.unitPrice());
            line.put("taxType", "IVA_RATE");
            line.put("tax", (int) Math.round(emitter.ivaRate()));
        }
        return root;
    }

    public ObjectNode debitNote(DebitNote debitNote, String invoiceAccessKey) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("invoiceAccessKey", invoiceAccessKey);

        ArrayNode reasons = root.putArray("reasons");
        for (DebitNoteItem item : debitNote.getItems()) {
            ObjectNode reason = reasons.addObject();
            reason.put("description", item.getMotivo());
            reason.put("amount", round(item.getAmount() == null ? 0 : item.getAmount()));
            reason.put("taxType", "IVA");
        }
        return root;
    }

    public ObjectNode withholding(Retention retention, String invoiceAccessKey) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("invoiceAccessKey", invoiceAccessKey);

        ArrayNode taxes = root.putArray("taxes");
        for (RetentionItem item : retention.getItems()) {
            ObjectNode tax = taxes.addObject();
            tax.put("taxType", mapRetentionTaxType(item.getTaxType()));
            tax.put("taxRateCode", item.getRetentionCode());
            tax.put("taxRate", item.getPercentage() == null ? 0 : item.getPercentage());
            tax.put("taxBase", round(item.getTaxableBase() == null ? 0 : item.getTaxableBase()));
        }
        return root;
    }

    public ObjectNode waybill(Waybill waybill, SriEmitterContext emitter) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("establishment", emitter.establecimientoCodigo());
        root.put("emissionPoint", emitter.puntoEmision());

        String transportDate = WAYBILL_DATE.format(waybill.getCreatedAt().toLocalDate());
        root.put("transportStartDate", transportDate);
        root.put("transportEndDate", transportDate);
        root.put("departureAddress", waybill.getDireccionPartida());
        root.put("transporterRuc", TaxIdValidator.normalize(waybill.getCarrierTaxId()));
        root.put("transporterName", waybill.getCarrierName());
        root.put("vehiclePlate", waybill.getCarrierPlate());

        ObjectNode customer = root.putObject("customer");
        customer.put("identificationType", resolveIdentificationType(waybill.getRecipientTaxId()));
        customer.put("identification", TaxIdValidator.normalize(waybill.getRecipientTaxId()));
        customer.put("legalName", waybill.getRecipientName());
        if (waybill.getRecipientEmail() != null && !waybill.getRecipientEmail().isBlank()) {
            customer.put("email", waybill.getRecipientEmail());
        }

        ArrayNode items = root.putArray("items");
        for (WaybillItem item : waybill.getItems()) {
            ObjectNode line = items.addObject();
            line.put("code", blankTo(item.getSku(), "ITEM-" + item.getProductId()));
            line.put("description", item.getProductName());
            line.put("quantity", item.getQuantity());
        }

        ObjectNode destination = objectMapper.createObjectNode();
        destination.put("receiverIdentification", TaxIdValidator.normalize(waybill.getRecipientTaxId()));
        destination.put("receiverName", waybill.getRecipientName());
        destination.put("address", waybill.getRecipientAddress());
        destination.put("transferReason", waybill.getMotivoTraslado());

        Invoice invoice = waybill.getInvoice();
        if (invoice != null && invoice.getSriDocumentNumber() != null) {
            destination.put("codDocSustento", "01");
            destination.put("numDocSustento", invoice.getSriDocumentNumber());
        }

        ArrayNode destinations = root.putArray("destinations");
        destinations.add(destination);
        return root;
    }

    private LineTax lineTaxFromCreditItem(CreditNoteItem item, SriEmitterContext emitter) {
        double quantity = item.getQuantity() == null ? 0 : item.getQuantity();
        double unitPrice = item.getUnitPrice() == null ? 0 : item.getUnitPrice();
        double lineTotal = round(quantity * unitPrice);

        if (emitter.pricesIncludeIva()) {
            double unit = quantity > 0 ? round(lineTotal / quantity) : 0;
            return new LineTax(unit);
        }
        return new LineTax(unitPrice);
    }

    private static String mapRetentionTaxType(String taxType) {
        if ("2".equals(taxType)) {
            return "IVA";
        }
        return "RENTA";
    }

    private static String resolveIdentificationType(String taxId) {
        String normalized = TaxIdValidator.normalize(taxId);
        if (normalized.length() == 13) {
            return "RUC";
        }
        if (normalized.length() == 10) {
            return "CEDULA";
        }
        return "RUC";
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private record LineTax(double unitPrice) {}
}
