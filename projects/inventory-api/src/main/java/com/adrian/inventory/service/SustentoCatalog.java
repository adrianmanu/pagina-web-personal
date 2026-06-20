package com.adrian.inventory.service;

import com.adrian.inventory.dto.SustentoCodeResponse;

import java.util.List;

public final class SustentoCatalog {

    private static final List<SustentoCodeResponse> CODES = List.of(
            new SustentoCodeResponse("01", "Crédito tributario — compras bienes", "CREDITO_TRIBUTARIO"),
            new SustentoCodeResponse("02", "Costo/gasto — compras bienes", "COSTO_GASTO"),
            new SustentoCodeResponse("03", "Costo/gasto — servicios", "COSTO_GASTO"),
            new SustentoCodeResponse("04", "Crédito tributario — servicios", "CREDITO_TRIBUTARIO"),
            new SustentoCodeResponse("05", "Arrendamiento mercantil", "COSTO_GASTO"),
            new SustentoCodeResponse("06", "Importaciones bienes", "CREDITO_TRIBUTARIO"));

    private SustentoCatalog() {}

    public static List<SustentoCodeResponse> all() {
        return CODES;
    }

    public static String labelFor(String code) {
        return CODES.stream()
                .filter(item -> item.code().equals(code))
                .map(SustentoCodeResponse::label)
                .findFirst()
                .orElse(code);
    }
}
