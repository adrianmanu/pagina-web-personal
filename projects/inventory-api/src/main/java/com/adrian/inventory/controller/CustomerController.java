package com.adrian.inventory.controller;

import com.adrian.inventory.dto.CustomerRequest;
import com.adrian.inventory.dto.CustomerResponse;
import com.adrian.inventory.dto.InvoiceResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<CustomerResponse> getAll(
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (q != null && !q.isBlank()) {
            return customerService.search(principal.getUser(), q);
        }
        return customerService.findAll(principal.getUser());
    }

    @GetMapping("/{id}")
    public CustomerResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return customerService.findById(id, principal.getUser());
    }

    @GetMapping("/{id}/invoices")
    public List<InvoiceResponse> getInvoices(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return customerService.findInvoices(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(
            @Valid @RequestBody CustomerRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return customerService.create(request, principal.getUser());
    }

    @PutMapping("/{id}")
    public CustomerResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return customerService.update(id, request, principal.getUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        customerService.delete(id, principal.getUser());
    }
}
