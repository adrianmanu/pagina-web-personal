package com.adrian.inventory.controller;

import com.adrian.inventory.dto.ProformaRequest;
import com.adrian.inventory.dto.ProformaResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.ProformaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proformas")
public class ProformaController {

    private final ProformaService proformaService;

    public ProformaController(ProformaService proformaService) {
        this.proformaService = proformaService;
    }

    @GetMapping
    public List<ProformaResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return proformaService.findAll(principal.getUser());
    }

    @GetMapping("/{id}")
    public ProformaResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return proformaService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProformaResponse create(
            @Valid @RequestBody ProformaRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return proformaService.create(request, principal.getUser());
    }

    @PostMapping("/{id}/convert")
    public ProformaResponse convert(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return proformaService.convertToInvoice(id, principal.getUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        proformaService.delete(id, principal.getUser());
    }
}
