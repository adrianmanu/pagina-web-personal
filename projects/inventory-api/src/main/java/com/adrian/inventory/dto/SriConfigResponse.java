package com.adrian.inventory.dto;

public record SriConfigResponse(
        boolean enabled,
        boolean configured,
        String provider,
        int ambiente,
        String ruc,
        String razonSocial,
        String establecimientoCodigo,
        String puntoEmision,
        boolean agenteRetencion,
        String agenteRetencionResolucion
) {}
