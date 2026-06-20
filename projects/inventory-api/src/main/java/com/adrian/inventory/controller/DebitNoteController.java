package com.adrian.inventory.controller;

import com.adrian.inventory.dto.DebitNoteRequest;
import com.adrian.inventory.dto.DebitNoteResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.DebitNoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debit-notes")
public class DebitNoteController {

    private final DebitNoteService debitNoteService;

    public DebitNoteController(DebitNoteService debitNoteService) {
        this.debitNoteService = debitNoteService;
    }

    @GetMapping
    public List<DebitNoteResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return debitNoteService.findAll(principal.getUser());
    }

    @GetMapping("/{id}")
    public DebitNoteResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return debitNoteService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DebitNoteResponse create(
            @Valid @RequestBody DebitNoteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return debitNoteService.create(request, principal.getUser());
    }

    @PostMapping("/{id}/sri/refresh")
    public DebitNoteResponse refreshSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return debitNoteService.refreshSriStatus(id, principal.getUser());
    }

    @PostMapping("/{id}/sri/reissue")
    public DebitNoteResponse reissueSri(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return debitNoteService.reissueSri(id, principal.getUser());
    }
}
