package com.adrian.inventory.service;

import com.adrian.inventory.exception.ApiException;
import org.springframework.http.HttpStatus;

public final class TaxIdValidator {

    private TaxIdValidator() {}

    public static String normalize(String taxId) {
        if (taxId == null) return "";
        return taxId.replaceAll("\\D", "");
    }

    public static void validate(String taxId) {
        String normalized = normalize(taxId);
        if (normalized.length() != 10 && normalized.length() != 13) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "La identificación debe ser cédula (10 dígitos) o RUC (13 dígitos)");
        }
    }

    public static void validateRuc(String ruc) {
        String normalized = normalize(ruc);
        if (normalized.length() != 13) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El RUC debe tener 13 dígitos");
        }
    }

    public static String resolveIdType(String taxId) {
        String normalized = normalize(taxId);
        if (normalized.length() == 13) return "04";
        if (normalized.length() == 10) return "05";
        return "04";
    }

    public static String idTypeLabel(String taxId) {
        return "04".equals(resolveIdType(taxId)) ? "RUC" : "Cédula";
    }
}
