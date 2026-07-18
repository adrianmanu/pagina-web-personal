package com.adrian.inventory.controller;

import com.adrian.inventory.dto.RetentionRequest;
import com.adrian.inventory.dto.RetentionResponse;
import com.adrian.inventory.dto.RetentionTaxCodeResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.RetentionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retentions")
public class RetentionController {

    private final RetentionService retentionService;

    public RetentionController(RetentionService retentionService) {
        this.retentionService = retentionService;
    }

    @GetMapping("/tax-codes")
    public List<RetentionTaxCodeResponse> getTaxCodes() {
        return retentionService.listTaxCodes();
    }

    @GetMapping
    public List<RetentionResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return retentionService.findAll(principal.getUser());
    }

    @GetMapping("/{id}")
    public RetentionResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return retentionService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RetentionResponse create(
            @Valid @RequestBody RetentionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return retentionService.create(request, principal.getUser());
    }

    @PostMapping("/{id}/sri/refresh")
    public RetentionResponse refreshSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return retentionService.refreshSriStatus(id, principal.getUser());
    }

    @PostMapping("/{id}/sri/reissue")
    public RetentionResponse reissueSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return retentionService.reissueSri(id, principal.getUser());
    }
}
