package com.adrian.inventory.dto;

public record SriConfigResponse(
        boolean enabled,
        boolean configured,
        int ambiente,
        String ruc,
        String razonSocial,
        String establecimientoCodigo,
        String puntoEmision
) {}
