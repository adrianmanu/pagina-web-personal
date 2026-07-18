package com.adrian.inventory.controller;

import com.adrian.inventory.dto.WaybillRequest;
import com.adrian.inventory.dto.WaybillResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.WaybillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waybills")
public class WaybillController {

    private final WaybillService waybillService;

    public WaybillController(WaybillService waybillService) {
        this.waybillService = waybillService;
    }

    @GetMapping
    public List<WaybillResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return waybillService.findAll(principal.getUser());
    }

    @GetMapping("/{id}")
    public WaybillResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return waybillService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WaybillResponse create(
            @Valid @RequestBody WaybillRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return waybillService.create(request, principal.getUser());
    }

    @PostMapping("/{id}/sri/refresh")
    public WaybillResponse refreshSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return waybillService.refreshSriStatus(id, principal.getUser());
    }

    @PostMapping("/{id}/sri/reissue")
    public WaybillResponse reissueSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return waybillService.reissueSri(id, principal.getUser());
    }
}
