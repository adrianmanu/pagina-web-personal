package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.dto.AtsPreviewResponse.AtsLineResponse;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class AtsXmlGenerator {

    private static final DateTimeFormatter ATS_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generate(AtsService.AtsPeriodData data, DatilProperties properties) {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<iva>\n");
        append(xml, "TipoIDInformante", "R");
        append(xml, "IdInformante", safe(properties.getRuc(), "0000000000000"));
        append(xml, "razonSocial", escape(safe(properties.getRazonSocial(), "INFORMANTE PRUEBA")));
        append(xml, "Anio", String.valueOf(data.year()));
        append(xml, "Mes", String.valueOf(data.month()));
        append(xml, "numEstabRuc", safe(properties.getEstablecimientoCodigo(), "001"));
        append(xml, "totalVentas", formatAmount(data.totalVentas()));
        append(xml, "codigoOperativo", "IVA");

        appendPurchases(xml, data.purchaseLines());
        appendManualSales(xml, data.saleManualLines());
        appendEstablishmentSales(xml, data, properties);
        appendCancelled(xml, data.creditNoteLines());
        appendIssuedRetentions(xml, data.retentionLines());

        xml.append("</iva>\n");
        return xml.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void appendPurchases(StringBuilder xml, List<AtsLineResponse> lines) {
        if (lines.isEmpty()) {
            return;
        }
        xml.append("  <compras>\n");
        for (var line : lines) {
            AtsDocumentParts.Parts parts = AtsDocumentParts.parse(line.documentNumber());
            xml.append("    <detalleCompras>\n");
            append(xml, 4, "codSustento", safe(line.sustentoCode(), "01"));
            append(xml, 4, "tpIdProv", taxIdType(line.partyTaxId()));
            append(xml, 4, "idProv", safe(line.partyTaxId(), "9999999999999"));
            append(xml, 4, "tipoComprobante", safe(line.documentType(), "01"));
            append(xml, 4, "parteRel", "NO");
            append(xml, 4, "fechaRegistro", safe(line.issueDate(), "01/01/2000").replace('-', '/'));
            append(xml, 4, "establecimiento", parts.establishment());
            append(xml, 4, "puntoEmision", parts.emissionPoint());
            append(xml, 4, "secuencial", parts.sequential());
            append(xml, 4, "fechaEmision", safe(line.issueDate(), "01/01/2000").replace('-', '/'));
            append(xml, 4, "autorizacion", line.documentNumber());
            append(xml, 4, "baseNoGraIva", "0.00");
            append(xml, 4, "baseImpGrav", formatAmount(line.subtotal()));
            append(xml, 4, "baseImpExe", "0.00");
            append(xml, 4, "montoIce", "0.00");
            append(xml, 4, "montoIva", formatAmount(line.iva()));
            append(xml, 4, "valRetBien10", "0.00");
            append(xml, 4, "valRetServ20", "0.00");
            append(xml, 4, "valorRetBienes", "0.00");
            append(xml, 4, "valorRetServicios", "0.00");
            append(xml, 4, "valRetServ100", "0.00");
            append(xml, 4, "totbasesImpReemb", "0.00");
            openTag(xml, 4, "pagoExterior");
            append(xml, 6, "pagoLocExt", "01");
            append(xml, 6, "paisEfecPago", "NA");
            append(xml, 6, "aplicConvDobTrib", "NA");
            append(xml, 6, "pagExtSujRetNorLeg", "NA");
            closeTag(xml, 4, "pagoExterior");
            if (line.total() > 500) {
                openTag(xml, 4, "formasDePago");
                append(xml, 6, "formaPago", "20");
                closeTag(xml, 4, "formasDePago");
            }
            xml.append("    </detalleCompras>\n");
        }
        xml.append("  </compras>\n");
    }

    private void appendManualSales(StringBuilder xml, List<AtsLineResponse> lines) {
        if (lines.isEmpty()) {
            return;
        }
        Map<String, List<AtsLineResponse>> grouped = lines.stream()
                .collect(Collectors.groupingBy(
                        line -> line.partyTaxId() + "|" + line.documentType(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        xml.append("  <ventas>\n");
        for (List<AtsLineResponse> group : grouped.values()) {
            AtsLineResponse first = group.get(0);
            double subtotal = group.stream().mapToDouble(AtsLineResponse::subtotal).sum();
            double iva = group.stream().mapToDouble(AtsLineResponse::iva).sum();
            xml.append("    <detalleVentas>\n");
            append(xml, 4, "tpIdCliente", taxIdType(first.partyTaxId()));
            append(xml, 4, "idCliente", safe(first.partyTaxId(), "9999999999999"));
            append(xml, 4, "parteRel", "NO");
            append(xml, 4, "tipoComprobante", safe(first.documentType(), "18"));
            append(xml, 4, "tipoEmision", "F");
            append(xml, 4, "numeroComprobantes", String.valueOf(group.size()));
            append(xml, 4, "baseNoGraIva", "0.00");
            append(xml, 4, "baseImpGrav", formatAmount(subtotal));
            append(xml, 4, "montoIva", formatAmount(iva));
            append(xml, 4, "montoIce", "0.00");
            append(xml, 4, "valorRetIva", "0.00");
            append(xml, 4, "valorRetRenta", "0.00");
            xml.append("    </detalleVentas>\n");
        }
        xml.append("  </ventas>\n");
    }

    private void appendEstablishmentSales(
            StringBuilder xml, AtsService.AtsPeriodData data, DatilProperties properties) {
        Map<String, Double> byEstablishment = new LinkedHashMap<>();
        data.saleElectronicLines().stream()
                .filter(line -> "AUTORIZADO".equalsIgnoreCase(line.sriStatus()))
                .forEach(line -> {
                    String estab = AtsDocumentParts.parse(line.documentNumber()).establishment();
                    byEstablishment.merge(estab, line.total(), Double::sum);
                });
        data.saleManualLines().forEach(line -> {
            String estab = safe(properties.getEstablecimientoCodigo(), "001");
            byEstablishment.merge(estab, line.total(), Double::sum);
        });
        data.creditNoteLines().stream()
                .filter(line -> "AUTORIZADO".equalsIgnoreCase(line.sriStatus()))
                .forEach(line -> {
                    String estab = AtsDocumentParts.parse(line.documentNumber()).establishment();
                    byEstablishment.merge(estab, -line.total(), Double::sum);
                });

        if (byEstablishment.isEmpty()) {
            return;
        }

        xml.append("  <ventasEstablecimiento>\n");
        for (Map.Entry<String, Double> entry : byEstablishment.entrySet()) {
            xml.append("    <ventaEst>\n");
            append(xml, 4, "codEstab", entry.getKey());
            append(xml, 4, "ventasEstab", formatAmount(Math.max(0, entry.getValue())));
            xml.append("    </ventaEst>\n");
        }
        xml.append("  </ventasEstablecimiento>\n");
    }

    private void appendCancelled(StringBuilder xml, List<AtsLineResponse> lines) {
        List<AtsLineResponse> authorized = lines.stream()
                .filter(line -> "AUTORIZADO".equalsIgnoreCase(line.sriStatus()))
                .toList();
        if (authorized.isEmpty()) {
            return;
        }
        xml.append("  <anulados>\n");
        for (var line : authorized) {
            AtsDocumentParts.Parts parts = AtsDocumentParts.parse(line.documentNumber());
            xml.append("    <anulado>\n");
            append(xml, 4, "tipoComprobante", safe(line.documentType(), "04"));
            append(xml, 4, "establecimiento", parts.establishment());
            append(xml, 4, "puntoEmision", parts.emissionPoint());
            append(xml, 4, "secInicio", parts.sequential());
            append(xml, 4, "secFin", parts.sequential());
            append(xml, 4, "autorizacion", line.documentNumber());
            xml.append("    </anulado>\n");
        }
        xml.append("  </anulados>\n");
    }

    private void appendIssuedRetentions(StringBuilder xml, List<AtsLineResponse> lines) {
        List<AtsLineResponse> authorized = lines.stream()
                .filter(line -> "AUTORIZADO".equalsIgnoreCase(line.sriStatus()))
                .toList();
        if (authorized.isEmpty()) {
            return;
        }
        xml.append("  <air>\n");
        for (var line : authorized) {
            AtsDocumentParts.Parts parts = AtsDocumentParts.parse(line.documentNumber());
            xml.append("    <detalleAir>\n");
            append(xml, 4, "estabRetencion1", parts.establishment());
            append(xml, 4, "ptoEmiRetencion1", parts.emissionPoint());
            append(xml, 4, "secRetencion1", parts.sequential());
            append(xml, 4, "autRetencion1", line.documentNumber());
            append(xml, 4, "fechaEmiRet1", safe(line.issueDate(), "01/01/2000").replace('-', '/'));
            append(xml, 4, "tpIdCliente", taxIdType(line.partyTaxId()));
            append(xml, 4, "idCliente", safe(line.partyTaxId(), "9999999999999"));
            append(xml, 4, "parteRel", "NO");
            append(xml, 4, "baseImpAir", formatAmount(line.subtotal()));
            append(xml, 4, "porcentajeAir", "1.00");
            append(xml, 4, "valRetAir", formatAmount(line.total()));
            xml.append("    </detalleAir>\n");
        }
        xml.append("  </air>\n");
    }

    private static void append(StringBuilder xml, String tag, String value) {
        append(xml, 2, tag, value);
    }

    private static void append(StringBuilder xml, int indent, String tag, String value) {
        xml.append(" ".repeat(indent))
                .append('<')
                .append(tag)
                .append('>')
                .append(escape(value))
                .append("</")
                .append(tag)
                .append(">\n");
    }

    private static void openTag(StringBuilder xml, int indent, String tag) {
        xml.append(" ".repeat(indent)).append('<').append(tag).append(">\n");
    }

    private static void closeTag(StringBuilder xml, int indent, String tag) {
        xml.append(" ".repeat(indent)).append("</").append(tag).append(">\n");
    }

    private static String taxIdType(String taxId) {
        if (taxId == null) {
            return "04";
        }
        String normalized = taxId.trim();
        if (normalized.length() == 10) {
            return "02";
        }
        if (normalized.length() == 13) {
            return "01";
        }
        return "04";
    }

    private static String formatAmount(double value) {
        return String.format(Locale.US, "%.2f", value);
    }

    private static String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static String escape(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
