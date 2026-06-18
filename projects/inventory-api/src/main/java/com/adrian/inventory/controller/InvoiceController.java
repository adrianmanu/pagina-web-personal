package com.adrian.inventory.controller;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.dto.InvoiceRequest;
import com.adrian.inventory.dto.InvoiceResponse;
import com.adrian.inventory.dto.SalesSummary;
import com.adrian.inventory.dto.SriConfigResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final DatilProperties datilProperties;

    public InvoiceController(InvoiceService invoiceService, DatilProperties datilProperties) {
        this.invoiceService = invoiceService;
        this.datilProperties = datilProperties;
    }

    @GetMapping("/sri/config")
    public SriConfigResponse getSriConfig() {
        return new SriConfigResponse(
                datilProperties.isEnabled(),
                datilProperties.isConfigured(),
                datilProperties.getAmbiente(),
                datilProperties.getRuc(),
                datilProperties.getRazonSocial(),
                datilProperties.getEstablecimientoCodigo(),
                datilProperties.getPuntoEmision()
        );
    }

    @GetMapping
    public List<InvoiceResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return invoiceService.findAll(principal.getUser());
    }

    @GetMapping("/summary")
    public SalesSummary getSummary(@AuthenticationPrincipal UserPrincipal principal) {
        return invoiceService.getSummary(principal.getUser());
    }

    @GetMapping("/{id}")
    public InvoiceResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return invoiceService.findById(id, principal.getUser());
    }

    @PostMapping("/{id}/sri/refresh")
    public InvoiceResponse refreshSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return invoiceService.refreshSriStatus(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(
            @Valid @RequestBody InvoiceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return invoiceService.create(request, principal.getUser());
    }
}
