package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.dto.AtsPreviewResponse.AtsLineResponse;
import com.adrian.inventory.dto.AtsPreviewResponse.AtsTotalsResponse;
import com.adrian.inventory.dto.AtsPreviewResponse.AtsValidationResponse;
import com.adrian.inventory.dto.AtsPreviewResponse;
import com.adrian.inventory.model.*;
import com.adrian.inventory.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AtsService {

    private final DatilProperties datilProperties;
    private final SriBillingService sriBillingService;
    private final InvoiceRepository invoiceRepository;
    private final CreditNoteRepository creditNoteRepository;
    private final DebitNoteRepository debitNoteRepository;
    private final RetentionRepository retentionRepository;
    private final ReceivedDocumentRepository receivedDocumentRepository;
    private final ManualSaleDocumentRepository manualSaleDocumentRepository;
    private final AtsXmlGenerator atsXmlGenerator;

    public AtsService(
            DatilProperties datilProperties,
            SriBillingService sriBillingService,
            InvoiceRepository invoiceRepository,
            CreditNoteRepository creditNoteRepository,
            DebitNoteRepository debitNoteRepository,
            RetentionRepository retentionRepository,
            ReceivedDocumentRepository receivedDocumentRepository,
            ManualSaleDocumentRepository manualSaleDocumentRepository,
            AtsXmlGenerator atsXmlGenerator) {
        this.datilProperties = datilProperties;
        this.sriBillingService = sriBillingService;
        this.invoiceRepository = invoiceRepository;
        this.creditNoteRepository = creditNoteRepository;
        this.debitNoteRepository = debitNoteRepository;
        this.retentionRepository = retentionRepository;
        this.receivedDocumentRepository = receivedDocumentRepository;
        this.manualSaleDocumentRepository = manualSaleDocumentRepository;
        this.atsXmlGenerator = atsXmlGenerator;
    }

    @Transactional(readOnly = true)
    public AtsPreviewResponse preview(User user, int year, int month) {
        AtsPeriodData data = loadPeriod(user, year, month);
        List<AtsValidationResponse> validations = validate(data);
        boolean ready = validations.stream().noneMatch(item -> "ERROR".equals(item.level()));

        return new AtsPreviewResponse(
                year,
                month,
                formatPeriod(year, month),
                datilProperties.getRuc(),
                datilProperties.getRazonSocial(),
                datilProperties.getEstablecimientoCodigo(),
                data.totalVentas(),
                totals(data.purchaseLines()),
                totals(data.saleManualLines()),
                totals(data.saleElectronicLines()),
                totals(data.creditNoteLines()),
                totals(data.retentionLines()),
                data.purchaseLines(),
                data.saleManualLines(),
                data.saleElectronicLines(),
                data.creditNoteLines(),
                data.retentionLines(),
                validations,
                ready,
                exportFileName(year, month));
    }

    @Transactional(readOnly = true)
    public byte[] exportXml(User user, int year, int month) {
        AtsPeriodData data = loadPeriod(user, year, month);
        List<AtsValidationResponse> validations = validate(data);
        if (validations.stream().anyMatch(item -> "ERROR".equals(item.level()))) {
            String message = validations.stream()
                    .filter(item -> "ERROR".equals(item.level()))
                    .map(AtsValidationResponse::message)
                    .findFirst()
                    .orElse("El ATS tiene errores de cuadre");
            throw new com.adrian.inventory.exception.ApiException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, message);
        }
        return atsXmlGenerator.generate(data, datilProperties);
    }

    private AtsPeriodData loadPeriod(User user, int year, int month) {
        YearMonth period = YearMonth.of(year, month);
        LocalDate fromDate = period.atDay(1);
        LocalDate toDate = period.atEndOfMonth();
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.plusDays(1).atStartOfDay().minusNanos(1);

        List<AtsLineResponse> purchaseLines = receivedDocumentRepository
                .search(user.getId(), null, null, null, fromDate, toDate)
                .stream()
                .map(this::toPurchaseLine)
                .toList();

        List<AtsLineResponse> saleManualLines = manualSaleDocumentRepository
                .findByUserIdAndIssueDateBetweenOrderByIssueDateAscIdAsc(user.getId(), fromDate, toDate)
                .stream()
                .map(this::toManualSaleLine)
                .toList();

        List<AtsLineResponse> saleElectronicLines = new ArrayList<>();
        invoiceRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .filter(doc -> inDateTimeRange(doc.getCreatedAt(), fromDateTime, toDateTime))
                .forEach(doc -> saleElectronicLines.add(toInvoiceLine(doc)));
        debitNoteRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .filter(doc -> inDateTimeRange(doc.getCreatedAt(), fromDateTime, toDateTime))
                .forEach(doc -> saleElectronicLines.add(toDebitNoteLine(doc)));

        List<AtsLineResponse> creditNoteLines = creditNoteRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .filter(doc -> inDateTimeRange(doc.getCreatedAt(), fromDateTime, toDateTime))
                .map(this::toCreditNoteLine)
                .toList();

        List<AtsLineResponse> retentionLines = retentionRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .filter(doc -> inDateTimeRange(doc.getCreatedAt(), fromDateTime, toDateTime))
                .map(this::toRetentionLine)
                .toList();

        double totalVentas = round(
                sumTotals(saleManualLines)
                        + sumAuthorizedTotals(saleElectronicLines)
                        - sumAuthorizedTotals(creditNoteLines));

        return new AtsPeriodData(
                year,
                month,
                fromDate,
                toDate,
                purchaseLines,
                saleManualLines,
                saleElectronicLines,
                creditNoteLines,
                retentionLines,
                totalVentas);
    }

    private List<AtsValidationResponse> validate(AtsPeriodData data) {
        List<AtsValidationResponse> validations = new ArrayList<>();

        int totalDocs = data.purchaseLines().size()
                + data.saleManualLines().size()
                + data.saleElectronicLines().size()
                + data.creditNoteLines().size()
                + data.retentionLines().size();

        if (totalDocs == 0) {
            validations.add(new AtsValidationResponse(
                    "INFO", "No hay documentos en el período seleccionado. Puedes exportar un ATS en cero."));
        }

        if (!sriBillingService.isEnabled()) {
            validations.add(new AtsValidationResponse(
                    "WARNING", "Motor SRI no configurado: el encabezado del ATS usará datos genéricos de prueba."));
        }

        data.purchaseLines().stream()
                .filter(line -> line.sustentoCode() == null || line.sustentoCode().isBlank())
                .findFirst()
                .ifPresent(ignored -> validations.add(new AtsValidationResponse(
                        "WARNING", "Hay compras sin código de sustento tributario.")));

        data.saleElectronicLines().stream()
                .filter(line -> !"AUTORIZADO".equalsIgnoreCase(line.sriStatus()))
                .findFirst()
                .ifPresent(ignored -> validations.add(new AtsValidationResponse(
                        "WARNING",
                        "Hay ventas electrónicas sin estado AUTORIZADO; no se incluirán en totales del XML.")));

        data.creditNoteLines().stream()
                .filter(line -> !"AUTORIZADO".equalsIgnoreCase(line.sriStatus()))
                .findFirst()
                .ifPresent(ignored -> validations.add(new AtsValidationResponse(
                        "WARNING", "Hay notas de crédito sin AUTORIZADO; no se reportarán como anulados.")));

        AtsTotalsResponse purchases = totals(data.purchaseLines());
        double purchaseSum = data.purchaseLines().stream().mapToDouble(AtsLineResponse::total).sum();
        if (Math.abs(purchaseSum - purchases.total()) > 0.02) {
            validations.add(new AtsValidationResponse(
                    "ERROR", "El total de compras no cuadra con la suma de líneas del período."));
        }

        double electronicAuthorized = sumAuthorizedTotals(data.saleElectronicLines());
        double manualTotal = sumTotals(data.saleManualLines());
        double creditAuthorized = sumAuthorizedTotals(data.creditNoteLines());
        double expectedVentas = round(manualTotal + electronicAuthorized - creditAuthorized);
        if (Math.abs(expectedVentas - data.totalVentas()) > 0.02) {
            validations.add(new AtsValidationResponse(
                    "ERROR", "El total de ventas no cuadra con ventas manuales + electrónicas - notas de crédito."));
        }

        return validations;
    }

    private AtsLineResponse toPurchaseLine(ReceivedDocument document) {
        AtsTaxHelper.TaxBreakdown tax = AtsTaxHelper.fromParts(
                document.getSubtotal(), document.getIva(), document.getTotal());
        return new AtsLineResponse(
                "COMPRA",
                document.getDocumentType(),
                document.getDocumentNumber(),
                document.getIssuerName(),
                document.getIssuerTaxId(),
                formatDate(document.getIssueDate()),
                null,
                tax.subtotal(),
                tax.iva(),
                tax.total(),
                document.getSustentoCode(),
                document.getSource());
    }

    private AtsLineResponse toManualSaleLine(ManualSaleDocument document) {
        AtsTaxHelper.TaxBreakdown tax = document.getSubtotal() != null
                ? AtsTaxHelper.fromParts(document.getSubtotal(), document.getIva(), document.getTotal())
                : AtsTaxHelper.breakdown(document.getTotal(), datilProperties);
        return new AtsLineResponse(
                "VENTA_MANUAL",
                document.getDocumentType(),
                document.getDocumentNumber(),
                document.getCustomerName(),
                document.getCustomerTaxId(),
                formatDate(document.getIssueDate()),
                "MANUAL",
                tax.subtotal(),
                tax.iva(),
                tax.total(),
                null,
                document.getNotes());
    }

    private AtsLineResponse toInvoiceLine(Invoice invoice) {
        AtsTaxHelper.TaxBreakdown tax = AtsTaxHelper.breakdown(invoice.getTotal(), datilProperties);
        return new AtsLineResponse(
                "VENTA_ELECTRONICA",
                "01",
                invoice.getSriDocumentNumber() == null ? "#" + invoice.getId() : invoice.getSriDocumentNumber(),
                invoice.getCustomerName(),
                invoice.getCustomerTaxId(),
                formatDate(invoice.getCreatedAt().toLocalDate()),
                invoice.getSriStatus(),
                tax.subtotal(),
                tax.iva(),
                tax.total(),
                null,
                invoice.isFinalConsumer() ? "Consumidor final" : null);
    }

    private AtsLineResponse toDebitNoteLine(DebitNote debitNote) {
        AtsTaxHelper.TaxBreakdown tax = AtsTaxHelper.breakdown(debitNote.getTotal(), datilProperties);
        Invoice invoice = debitNote.getInvoice();
        return new AtsLineResponse(
                "VENTA_ELECTRONICA",
                "05",
                debitNote.getSriDocumentNumber() == null ? "#" + debitNote.getId() : debitNote.getSriDocumentNumber(),
                invoice.getCustomerName(),
                invoice.getCustomerTaxId(),
                formatDate(debitNote.getCreatedAt().toLocalDate()),
                debitNote.getSriStatus(),
                tax.subtotal(),
                tax.iva(),
                tax.total(),
                null,
                "Nota de débito");
    }

    private AtsLineResponse toCreditNoteLine(CreditNote creditNote) {
        AtsTaxHelper.TaxBreakdown tax = AtsTaxHelper.breakdown(creditNote.getTotal(), datilProperties);
        Invoice invoice = creditNote.getInvoice();
        return new AtsLineResponse(
                "ANULADO",
                "04",
                creditNote.getSriDocumentNumber() == null ? "#" + creditNote.getId() : creditNote.getSriDocumentNumber(),
                invoice.getCustomerName(),
                invoice.getCustomerTaxId(),
                formatDate(creditNote.getCreatedAt().toLocalDate()),
                creditNote.getSriStatus(),
                tax.subtotal(),
                tax.iva(),
                tax.total(),
                null,
                creditNote.getMotivo());
    }

    private AtsLineResponse toRetentionLine(Retention retention) {
        return new AtsLineResponse(
                "RETENCION_EMITIDA",
                "07",
                retention.getSriDocumentNumber() == null ? "#" + retention.getId() : retention.getSriDocumentNumber(),
                retention.getSupplier().getName(),
                retention.getSupplier().getTaxId(),
                formatDate(retention.getCreatedAt().toLocalDate()),
                retention.getSriStatus(),
                retention.getTotalRetained(),
                0.0,
                retention.getTotalRetained(),
                null,
                retention.getSupportDocumentNumber());
    }

    private static AtsTotalsResponse totals(List<AtsLineResponse> lines) {
        double subtotal = round(lines.stream().mapToDouble(AtsLineResponse::subtotal).sum());
        double iva = round(lines.stream().mapToDouble(AtsLineResponse::iva).sum());
        double total = round(lines.stream().mapToDouble(AtsLineResponse::total).sum());
        return new AtsTotalsResponse(subtotal, iva, total, lines.size());
    }

    private static double sumTotals(List<AtsLineResponse> lines) {
        return round(lines.stream().mapToDouble(AtsLineResponse::total).sum());
    }

    private static double sumAuthorizedTotals(List<AtsLineResponse> lines) {
        return round(lines.stream()
                .filter(line -> "AUTORIZADO".equalsIgnoreCase(line.sriStatus()))
                .mapToDouble(AtsLineResponse::total)
                .sum());
    }

    private static boolean inDateTimeRange(LocalDateTime value, LocalDateTime from, LocalDateTime to) {
        return value != null && !value.isBefore(from) && !value.isAfter(to);
    }

    private static String formatDate(LocalDate date) {
        return date == null ? null : date.toString();
    }

    private static String formatPeriod(int year, int month) {
        return String.format(Locale.forLanguageTag("es-EC"), "%02d/%04d", month, year);
    }

    public static String exportFileName(int year, int month) {
        return String.format("AT%02d%04d.zip", month, year);
    }

    private static double round(double value) {
        return AtsTaxHelper.round(value);
    }

    public record AtsPeriodData(
            int year,
            int month,
            LocalDate fromDate,
            LocalDate toDate,
            List<AtsLineResponse> purchaseLines,
            List<AtsLineResponse> saleManualLines,
            List<AtsLineResponse> saleElectronicLines,
            List<AtsLineResponse> creditNoteLines,
            List<AtsLineResponse> retentionLines,
            double totalVentas) {}
}
