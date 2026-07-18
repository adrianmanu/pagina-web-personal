package com.adrian.inventory.controller;

import com.adrian.inventory.dto.BusinessProfileRequest;
import com.adrian.inventory.dto.BusinessProfileResponse;
import com.adrian.inventory.dto.EmissionPointRequest;
import com.adrian.inventory.dto.EmissionPointResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.BusinessSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final BusinessSettingsService businessSettingsService;

    public SettingsController(BusinessSettingsService businessSettingsService) {
        this.businessSettingsService = businessSettingsService;
    }

    @GetMapping("/business")
    public BusinessProfileResponse getBusiness(@AuthenticationPrincipal UserPrincipal principal) {
        return businessSettingsService.getProfile(principal.getUser());
    }

    @PutMapping("/business")
    public BusinessProfileResponse saveBusiness(
            @Valid @RequestBody BusinessProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return businessSettingsService.saveProfile(request, principal.getUser());
    }

    @PostMapping("/onboarding/complete")
    public BusinessProfileResponse completeOnboarding(@AuthenticationPrincipal UserPrincipal principal) {
        return businessSettingsService.completeOnboarding(principal.getUser());
    }

    @PostMapping("/onboarding/step")
    public BusinessProfileResponse advanceStep(
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        int step = body.getOrDefault("step", 0);
        return businessSettingsService.advanceOnboardingStep(principal.getUser(), step);
    }

    @GetMapping("/emission-points")
    public List<EmissionPointResponse> listEmissionPoints(@AuthenticationPrincipal UserPrincipal principal) {
        return businessSettingsService.listEmissionPoints(principal.getUser());
    }

    @PostMapping("/emission-points")
    @ResponseStatus(HttpStatus.CREATED)
    public EmissionPointResponse createEmissionPoint(
            @Valid @RequestBody EmissionPointRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return businessSettingsService.createEmissionPoint(request, principal.getUser());
    }

    @DeleteMapping("/emission-points/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmissionPoint(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        businessSettingsService.deleteEmissionPoint(id, principal.getUser());
    }
}
