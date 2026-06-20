package com.adrian.inventory.controller;

import com.adrian.inventory.dto.CreditNoteRequest;
import com.adrian.inventory.dto.CreditNoteResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.CreditNoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/credit-notes")
public class CreditNoteController {

    private final CreditNoteService creditNoteService;

    public CreditNoteController(CreditNoteService creditNoteService) {
        this.creditNoteService = creditNoteService;
    }

    @GetMapping
    public List<CreditNoteResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return creditNoteService.findAll(principal.getUser());
    }

    @GetMapping("/{id}")
    public CreditNoteResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return creditNoteService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreditNoteResponse create(
            @Valid @RequestBody CreditNoteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return creditNoteService.create(request, principal.getUser());
    }

    @PostMapping("/{id}/sri/refresh")
    public CreditNoteResponse refreshSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return creditNoteService.refreshSriStatus(id, principal.getUser());
    }
}
