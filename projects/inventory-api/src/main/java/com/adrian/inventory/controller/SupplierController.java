package com.adrian.inventory.controller;

import com.adrian.inventory.dto.SupplierRequest;
import com.adrian.inventory.dto.SupplierResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public List<SupplierResponse> getAll(
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (q != null && !q.isBlank()) {
            return supplierService.search(principal.getUser(), q);
        }
        return supplierService.findAll(principal.getUser());
    }

    @GetMapping("/{id}")
    public SupplierResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return supplierService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierResponse create(
            @Valid @RequestBody SupplierRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return supplierService.create(request, principal.getUser());
    }

    @PutMapping("/{id}")
    public SupplierResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return supplierService.update(id, request, principal.getUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        supplierService.delete(id, principal.getUser());
    }
}
