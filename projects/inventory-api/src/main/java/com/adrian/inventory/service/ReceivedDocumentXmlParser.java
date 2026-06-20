package com.adrian.inventory.service;

import com.adrian.inventory.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ReceivedDocumentXmlParser {

    private static final Pattern CDATA_COMPROBANTE =
            Pattern.compile("<comprobante>\\s*<!\\[CDATA\\[(.*?)]]>\\s*</comprobante>", Pattern.DOTALL);

    public record ParsedReceivedDocument(
            String documentType,
            String documentNumber,
            String accessKey,
            String authorizationNumber,
            LocalDate issueDate,
            String issuerName,
            String issuerTaxId,
            Double subtotal,
            Double iva,
            Double total
    ) {}

    private ReceivedDocumentXmlParser() {}

    public static ParsedReceivedDocument parse(String rawXml) {
        if (rawXml == null || rawXml.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El XML está vacío");
        }

        String xml = unwrapAutorizacion(rawXml.trim());
        Document document = parseDocument(xml);

        String rootName = document.getDocumentElement().getNodeName().toLowerCase(Locale.ROOT);
        String documentType = text(document, "infoTributaria", "codDoc");
        if (documentType == null || documentType.isBlank()) {
            documentType = mapRootToDocumentType(rootName);
        }

        String estab = text(document, "infoTributaria", "estab");
        String ptoEmi = text(document, "infoTributaria", "ptoEmi");
        String secuencial = text(document, "infoTributaria", "secuencial");
        String documentNumber = formatDocumentNumber(estab, ptoEmi, secuencial);

        String accessKey = firstNonBlank(
                text(document, "infoTributaria", "claveAcceso"),
                text(document, "numeroAutorizacion"));
        accessKey = normalizeAccessKey(accessKey);

        String authorizationNumber = text(document, "numeroAutorizacion");

        LocalDate issueDate = parseIssueDate(document, rootName);
        String issuerName = firstNonBlank(
                text(document, "infoTributaria", "razonSocial"),
                text(document, "infoTributaria", "nombreComercial"));
        String issuerTaxId = text(document, "infoTributaria", "ruc");

        Double subtotal = parseDouble(firstNonBlank(
                text(document, "infoFactura", "totalSinImpuestos"),
                text(document, "infoNotaCredito", "totalSinImpuestos"),
                text(document, "infoLiquidacionCompra", "totalSinImpuestos"),
                text(document, "infoCompRetencion", "totalSinImpuestos")));

        Double total = parseDouble(firstNonBlank(
                text(document, "infoFactura", "importeTotal"),
                text(document, "infoNotaCredito", "valorModificacion"),
                text(document, "infoLiquidacionCompra", "importeTotal"),
                text(document, "infoCompRetencion", "importeTotal")));

        Double iva = sumIva(document);
        if (iva == null && subtotal != null && total != null) {
            double diff = total - subtotal;
            if (diff >= 0) {
                iva = diff;
            }
        }

        if (documentNumber == null || documentNumber.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No se pudo extraer el número de comprobante del XML");
        }
        if (issuerTaxId == null || issuerTaxId.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No se pudo extraer el RUC del emisor del XML");
        }
        if (issueDate == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No se pudo extraer la fecha de emisión del XML");
        }

        return new ParsedReceivedDocument(
                documentType == null ? "01" : documentType.trim(),
                documentNumber,
                blankToNull(accessKey),
                blankToNull(authorizationNumber),
                issueDate,
                issuerName == null ? issuerTaxId : issuerName.trim(),
                issuerTaxId.trim(),
                subtotal,
                iva,
                total);
    }

    private static String unwrapAutorizacion(String rawXml) {
        Matcher matcher = CDATA_COMPROBANTE.matcher(rawXml);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        if (rawXml.contains("<autorizacion")) {
            Document auth = parseDocument(rawXml);
            String cdata = text(auth, "comprobante");
            if (cdata != null && !cdata.isBlank()) {
                return cdata.trim();
            }
        }
        return rawXml;
    }

    private static Document parseDocument(String xml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setExpandEntityReferences(false);
            factory.setNamespaceAware(false);
            return factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "XML inválido: " + ex.getMessage());
        }
    }

    private static String mapRootToDocumentType(String rootName) {
        return switch (rootName) {
            case "notacredito" -> "04";
            case "notadebito" -> "05";
            case "liquidacioncompra" -> "03";
            case "comprobanteretencion" -> "07";
            default -> "01";
        };
    }

    private static LocalDate parseIssueDate(Document document, String rootName) {
        String raw = firstNonBlank(
                text(document, "infoFactura", "fechaEmision"),
                text(document, "infoNotaCredito", "fechaEmision"),
                text(document, "infoLiquidacionCompra", "fechaEmision"),
                text(document, "infoCompRetencion", "fechaEmision"));
        if (raw == null) {
            return null;
        }
        String normalized = raw.trim().replace('-', '/');
        for (String pattern : new String[] {"d/M/uuuu", "d/M/yy", "uuuu-M-d"}) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
                return LocalDate.parse(normalized, formatter);
            } catch (DateTimeParseException ignored) {
                // try next pattern
            }
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, "Fecha de emisión no reconocida: " + raw);
    }

    private static Double sumIva(Document document) {
        NodeList impuestos = document.getElementsByTagName("totalImpuesto");
        if (impuestos.getLength() == 0) {
            return null;
        }
        double sum = 0;
        boolean found = false;
        for (int i = 0; i < impuestos.getLength(); i++) {
            Node node = impuestos.item(i);
            String codigo = childText(node, "codigo");
            if (codigo != null && !"2".equals(codigo.trim())) {
                continue;
            }
            Double valor = parseDouble(childText(node, "valor"));
            if (valor != null) {
                sum += valor;
                found = true;
            }
        }
        return found ? sum : null;
    }

    private static String formatDocumentNumber(String estab, String ptoEmi, String secuencial) {
        if (estab == null || ptoEmi == null || secuencial == null) {
            return null;
        }
        return String.format("%s-%s-%s", estab.trim(), ptoEmi.trim(), secuencial.trim());
    }

    private static String text(Document document, String... path) {
        if (path.length == 1) {
            NodeList nodes = document.getElementsByTagName(path[0]);
            if (nodes.getLength() == 0) {
                return null;
            }
            return nodes.item(0).getTextContent();
        }
        NodeList parents = document.getElementsByTagName(path[0]);
        if (parents.getLength() == 0) {
            return null;
        }
        return childText(parents.item(0), path[1]);
    }

    private static String childText(Node parent, String tag) {
        if (parent == null) {
            return null;
        }
        NodeList children = parent.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            if (child.getNodeName().equalsIgnoreCase(tag)) {
                return child.getTextContent();
            }
        }
        return null;
    }

    private static Double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(value.trim().replace(',', '.'));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String normalizeAccessKey(String accessKey) {
        if (accessKey == null || accessKey.isBlank()) {
            return null;
        }
        String trimmed = accessKey.trim();
        return trimmed.length() == 49 ? trimmed : null;
    }
}
