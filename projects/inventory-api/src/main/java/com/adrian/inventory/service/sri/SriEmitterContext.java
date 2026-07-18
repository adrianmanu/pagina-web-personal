package com.adrian.inventory.service.sri;

public record SriEmitterContext(
        String ruc,
        String razonSocial,
        String nombreComercial,
        String direccion,
        String establecimientoCodigo,
        String puntoEmision,
        String establecimientoDireccion,
        double ivaRate,
        int ivaCodigo,
        boolean pricesIncludeIva,
        boolean agenteRetencion,
        String agenteRetencionResolucion) {

    public boolean hasRuc() {
        return ruc != null && !ruc.isBlank();
    }
}
