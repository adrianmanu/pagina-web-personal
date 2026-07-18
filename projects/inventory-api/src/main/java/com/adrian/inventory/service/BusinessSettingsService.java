package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.dto.BusinessProfileRequest;
import com.adrian.inventory.dto.BusinessProfileResponse;
import com.adrian.inventory.dto.EmissionPointRequest;
import com.adrian.inventory.dto.EmissionPointResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.BusinessProfile;
import com.adrian.inventory.model.EmissionPoint;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.BusinessProfileRepository;
import com.adrian.inventory.repository.EmissionPointRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BusinessSettingsService {

    private final BusinessProfileRepository businessProfileRepository;
    private final EmissionPointRepository emissionPointRepository;
    private final DatilProperties datilProperties;

    public BusinessSettingsService(
            BusinessProfileRepository businessProfileRepository,
            EmissionPointRepository emissionPointRepository,
            DatilProperties datilProperties) {
        this.businessProfileRepository = businessProfileRepository;
        this.emissionPointRepository = emissionPointRepository;
        this.datilProperties = datilProperties;
    }

    public BusinessProfileResponse getProfile(User user) {
        return BusinessProfileResponse.from(getOrCreateProfile(user));
    }

    @Transactional
    public BusinessProfileResponse saveProfile(BusinessProfileRequest request, User user) {
        if (request.businessName() == null || request.businessName().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El nombre comercial es obligatorio");
        }
        if (request.razonSocial() == null || request.razonSocial().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La razón social es obligatoria");
        }
        TaxIdValidator.validateRuc(request.ruc());
        String email = blankToNull(request.emailNotificaciones());
        if (email != null && !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El correo de notificaciones no es válido");
        }

        BusinessProfile profile = getOrCreateProfile(user);
        profile.setBusinessName(request.businessName().trim());
        profile.setRuc(TaxIdValidator.normalize(request.ruc().trim()));
        profile.setRazonSocial(request.razonSocial().trim());
        profile.setDireccion(blankToNull(request.direccion()));
        profile.setEmailNotificaciones(email);
        if (profile.getOnboardingStep() < 1) {
            profile.setOnboardingStep(1);
        }
        return BusinessProfileResponse.from(businessProfileRepository.save(profile));
    }

    @Transactional
    public BusinessProfileResponse completeOnboarding(User user) {
        BusinessProfile profile = getOrCreateProfile(user);
        profile.setOnboardingCompleted(true);
        profile.setOnboardingStep(5);
        return BusinessProfileResponse.from(businessProfileRepository.save(profile));
    }

    @Transactional
    public BusinessProfileResponse advanceOnboardingStep(User user, int step) {
        BusinessProfile profile = getOrCreateProfile(user);
        profile.setOnboardingStep(Math.max(profile.getOnboardingStep(), step));
        return BusinessProfileResponse.from(businessProfileRepository.save(profile));
    }

    public List<EmissionPointResponse> listEmissionPoints(User user) {
        ensureDefaultEmissionPoint(user);
        return emissionPointRepository.findByUserIdOrderByDefaultPointDescLabelAsc(user.getId()).stream()
                .map(EmissionPointResponse::from)
                .toList();
    }

    @Transactional
    public EmissionPointResponse createEmissionPoint(EmissionPointRequest request, User user) {
        if (request.defaultPoint() == null || !request.defaultPoint()) {
            long count = emissionPointRepository.findByUserIdOrderByDefaultPointDescLabelAsc(user.getId()).size();
            if (count == 0) {
                return createPoint(request, user, true);
            }
        }
        if (Boolean.TRUE.equals(request.defaultPoint())) {
            clearDefaultPoints(user);
        }
        return createPoint(request, user, Boolean.TRUE.equals(request.defaultPoint()));
    }

    @Transactional
    public void deleteEmissionPoint(Long id, User user) {
        EmissionPoint point = emissionPointRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Punto de emisión no encontrado"));
        emissionPointRepository.delete(point);
        ensureDefaultEmissionPoint(user);
    }

    public boolean isOnboardingCompleted(User user) {
        return getOrCreateProfile(user).isOnboardingCompleted();
    }

    public int onboardingStep(User user) {
        return getOrCreateProfile(user).getOnboardingStep();
    }

    @Transactional
    public BusinessProfile getOrCreateProfile(User user) {
        return businessProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            BusinessProfile profile = new BusinessProfile();
            profile.setUser(user);
            profile.setBusinessName(user.getFullName());
            profile.setRuc(datilProperties.getRuc() == null ? "" : datilProperties.getRuc());
            profile.setRazonSocial(
                    datilProperties.getRazonSocial() == null ? user.getFullName() : datilProperties.getRazonSocial());
            profile.setDireccion(datilProperties.getDireccion());
            profile.setOnboardingCompleted(false);
            profile.setOnboardingStep(0);
            return businessProfileRepository.save(profile);
        });
    }

    private EmissionPointResponse createPoint(EmissionPointRequest request, User user, boolean defaultPoint) {
        validateEmissionCode(request.establishmentCode(), "El código de establecimiento");
        validateEmissionCode(request.emissionPointCode(), "El código de punto de emisión");
        if (request.label() == null || request.label().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La etiqueta del punto de emisión es obligatoria");
        }

        EmissionPoint point = new EmissionPoint();
        point.setUser(user);
        point.setEstablishmentCode(request.establishmentCode().trim());
        point.setEmissionPointCode(request.emissionPointCode().trim());
        point.setLabel(request.label().trim());
        point.setAddress(blankToNull(request.address()));
        point.setDefaultPoint(defaultPoint);
        return EmissionPointResponse.from(emissionPointRepository.save(point));
    }

    private static void validateEmissionCode(String code, String label) {
        if (code == null || code.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, label + " es obligatorio");
        }
        if (!code.trim().matches("\\d{3}")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, label + " debe tener 3 dígitos (ej. 001)");
        }
    }

    private void ensureDefaultEmissionPoint(User user) {
        if (emissionPointRepository.findByUserIdAndDefaultPointTrue(user.getId()).isPresent()) {
            return;
        }
        List<EmissionPoint> points = emissionPointRepository.findByUserIdOrderByDefaultPointDescLabelAsc(user.getId());
        if (!points.isEmpty()) {
            EmissionPoint first = points.get(0);
            first.setDefaultPoint(true);
            emissionPointRepository.save(first);
            return;
        }
        EmissionPoint point = new EmissionPoint();
        point.setUser(user);
        point.setEstablishmentCode(datilProperties.getEstablecimientoCodigo());
        point.setEmissionPointCode(datilProperties.getPuntoEmision());
        point.setLabel("Principal");
        point.setAddress(datilProperties.getEstablecimientoDireccion());
        point.setDefaultPoint(true);
        emissionPointRepository.save(point);
    }

    private void clearDefaultPoints(User user) {
        emissionPointRepository.findByUserIdOrderByDefaultPointDescLabelAsc(user.getId()).forEach(point -> {
            point.setDefaultPoint(false);
            emissionPointRepository.save(point);
        });
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
