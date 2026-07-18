package com.adrian.inventory.controller;

import com.adrian.inventory.dto.ReceivedDocumentRequest;
import com.adrian.inventory.dto.ReceivedDocumentResponse;
import com.adrian.inventory.dto.ReceivedDocumentUploadRequest;
import com.adrian.inventory.dto.SustentoCodeResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.ReceivedDocumentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/received-documents")
public class ReceivedDocumentController {

    private final ReceivedDocumentService receivedDocumentService;

    public ReceivedDocumentController(ReceivedDocumentService receivedDocumentService) {
        this.receivedDocumentService = receivedDocumentService;
    }

    @GetMapping("/sustento-codes")
    public List<SustentoCodeResponse> getSustentoCodes() {
        return receivedDocumentService.listSustentoCodes();
    }

    @GetMapping
    public List<ReceivedDocumentResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) String issuerTaxId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal UserPrincipal principal) {
        return receivedDocumentService.search(principal.getUser(), q, documentType, issuerTaxId, from, to);
    }

    @GetMapping("/{id}")
    public ReceivedDocumentResponse getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return receivedDocumentService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReceivedDocumentResponse createManual(
            @Valid @RequestBody ReceivedDocumentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return receivedDocumentService.createManual(request, principal.getUser());
    }

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public ReceivedDocumentResponse uploadXml(
            @Valid @RequestBody ReceivedDocumentUploadRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return receivedDocumentService.uploadXml(request, principal.getUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        receivedDocumentService.delete(id, principal.getUser());
    }
}
