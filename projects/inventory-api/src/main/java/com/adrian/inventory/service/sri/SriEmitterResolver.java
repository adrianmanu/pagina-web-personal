package com.adrian.inventory.service.sri;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.BusinessProfile;
import com.adrian.inventory.model.EmissionPoint;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.EmissionPointRepository;
import com.adrian.inventory.service.BusinessSettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class SriEmitterResolver {

    private final DatilProperties datilProperties;
    private final BusinessSettingsService businessSettingsService;
    private final EmissionPointRepository emissionPointRepository;

    public SriEmitterResolver(
            DatilProperties datilProperties,
            BusinessSettingsService businessSettingsService,
            EmissionPointRepository emissionPointRepository) {
        this.datilProperties = datilProperties;
        this.businessSettingsService = businessSettingsService;
        this.emissionPointRepository = emissionPointRepository;
    }

    public SriEmitterContext resolve(User user) {
        BusinessProfile profile = businessSettingsService.getOrCreateProfile(user);
        EmissionPoint point = emissionPointRepository
                .findByUserIdAndDefaultPointTrue(user.getId())
                .orElse(null);

        String ruc = firstNonBlank(profile.getRuc(), datilProperties.getRuc());
        String razonSocial = firstNonBlank(profile.getRazonSocial(), datilProperties.getRazonSocial());
        String nombreComercial = firstNonBlank(profile.getBusinessName(), datilProperties.getNombreComercial());
        String direccion = firstNonBlank(profile.getDireccion(), datilProperties.getDireccion());
        String establecimiento = point != null
                ? point.getEstablishmentCode()
                : datilProperties.getEstablecimientoCodigo();
        String puntoEmision = point != null
                ? point.getEmissionPointCode()
                : datilProperties.getPuntoEmision();
        String establecimientoDireccion = point != null && point.getAddress() != null && !point.getAddress().isBlank()
                ? point.getAddress()
                : datilProperties.getEstablecimientoDireccion();

        return new SriEmitterContext(
                ruc,
                razonSocial,
                nombreComercial,
                direccion,
                establecimiento,
                puntoEmision,
                establecimientoDireccion,
                datilProperties.getIvaRate(),
                parseIvaCodigo(datilProperties.getIvaCodigoPorcentaje()),
                datilProperties.isPricesIncludeIva(),
                datilProperties.isAgenteRetencion(),
                datilProperties.getAgenteRetencionResolucion());
    }

    public SriEmitterContext require(User user) {
        SriEmitterContext context = resolve(user);
        if (!context.hasRuc()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Configure el RUC del negocio en su perfil antes de conectar con el SRI");
        }
        return context;
    }

    private static String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary.trim();
        }
        return fallback == null ? "" : fallback.trim();
    }

    private static int parseIvaCodigo(String code) {
        if (code == null || code.isBlank()) {
            return 4;
        }
        try {
            return Integer.parseInt(code.trim());
        } catch (NumberFormatException ex) {
            return 4;
        }
    }
}
