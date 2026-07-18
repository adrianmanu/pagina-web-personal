package com.adrian.inventory.controller;

import com.adrian.inventory.dto.PurchaseSettlementRequest;
import com.adrian.inventory.dto.PurchaseSettlementResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.PurchaseSettlementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-settlements")
public class PurchaseSettlementController {

    private final PurchaseSettlementService purchaseSettlementService;

    public PurchaseSettlementController(PurchaseSettlementService purchaseSettlementService) {
        this.purchaseSettlementService = purchaseSettlementService;
    }

    @GetMapping
    public List<PurchaseSettlementResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return purchaseSettlementService.findAll(principal.getUser());
    }

    @GetMapping("/{id}")
    public PurchaseSettlementResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return purchaseSettlementService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseSettlementResponse create(
            @Valid @RequestBody PurchaseSettlementRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return purchaseSettlementService.create(request, principal.getUser());
    }

    @PostMapping("/{id}/sri/refresh")
    public PurchaseSettlementResponse refreshSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return purchaseSettlementService.refreshSriStatus(id, principal.getUser());
    }

    @PostMapping("/{id}/sri/reissue")
    public PurchaseSettlementResponse reissueSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return purchaseSettlementService.reissueSri(id, principal.getUser());
    }
}
