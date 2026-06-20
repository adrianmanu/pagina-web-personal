package com.adrian.inventory.service;

import com.adrian.inventory.dto.RetentionTaxCodeResponse;
import com.adrian.inventory.exception.ApiException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

public final class RetentionTaxCatalog {

    private static final List<RetentionTaxCodeResponse> CODES = List.of(
            new RetentionTaxCodeResponse(
                    "renta-1-servicios", "1", "312", 1.0, "Renta 1% — servicios profesionales"),
            new RetentionTaxCodeResponse(
                    "renta-2-bienes", "1", "343", 2.0, "Renta 2% — transferencia de bienes"),
            new RetentionTaxCodeResponse(
                    "renta-8-intelecto", "1", "304", 8.0, "Renta 8% — servicios (predomina intelecto)"),
            new RetentionTaxCodeResponse("renta-10-mano-obra", "1", "303", 10.0, "Renta 10% — servicios (mano de obra)"),
            new RetentionTaxCodeResponse("iva-30", "2", "3", 30.0, "IVA 30% — servicios"),
            new RetentionTaxCodeResponse("iva-70", "2", "4", 70.0, "IVA 70% — bienes"),
            new RetentionTaxCodeResponse("iva-100", "2", "5", 100.0, "IVA 100%"));

    private RetentionTaxCatalog() {}

    public static List<RetentionTaxCodeResponse> all() {
        return CODES;
    }

    public static RetentionTaxCodeResponse require(String id) {
        return find(id)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Código de retención no válido: " + id));
    }

    public static Optional<RetentionTaxCodeResponse> find(String id) {
        return CODES.stream().filter(code -> code.id().equals(id)).findFirst();
    }
}
