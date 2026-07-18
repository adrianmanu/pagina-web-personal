package com.adrian.inventory.dto;

import com.adrian.inventory.model.EmissionPoint;

public record EmissionPointResponse(
        Long id,
        String establishmentCode,
        String emissionPointCode,
        String label,
        String address,
        boolean defaultPoint
) {
    public static EmissionPointResponse from(EmissionPoint point) {
        return new EmissionPointResponse(
                point.getId(),
                point.getEstablishmentCode(),
                point.getEmissionPointCode(),
                point.getLabel(),
                point.getAddress(),
                point.isDefaultPoint());
    }
}
