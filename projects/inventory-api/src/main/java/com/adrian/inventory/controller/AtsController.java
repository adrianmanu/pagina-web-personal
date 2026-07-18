package com.adrian.inventory.controller;

import com.adrian.inventory.dto.AtsPreviewResponse;
import com.adrian.inventory.dto.ManualSaleDocumentRequest;
import com.adrian.inventory.dto.ManualSaleDocumentResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.AtsService;
import com.adrian.inventory.service.ManualSaleDocumentService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/ats")
public class AtsController {

    private final AtsService atsService;
    private final ManualSaleDocumentService manualSaleDocumentService;

    public AtsController(AtsService atsService, ManualSaleDocumentService manualSaleDocumentService) {
        this.atsService = atsService;
        this.manualSaleDocumentService = manualSaleDocumentService;
    }

    @GetMapping("/preview")
    public AtsPreviewResponse preview(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal UserPrincipal principal) {
        validatePeriod(year, month);
        return atsService.preview(principal.getUser(), year, month);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        validatePeriod(year, month);
        byte[] xml = atsService.exportXml(principal.getUser(), year, month);
        String zipName = AtsService.exportFileName(year, month);
        String xmlName = zipName.replace(".zip", ".xml");

        ByteArrayOutputStream zipBuffer = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(zipBuffer)) {
            ZipEntry entry = new ZipEntry(xmlName);
            zip.putNextEntry(entry);
            zip.write(xml);
            zip.closeEntry();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/zip"));
        headers.setContentDisposition(ContentDisposition.attachment().filename(zipName).build());
        return new ResponseEntity<>(zipBuffer.toByteArray(), headers, HttpStatus.OK);
    }

    @GetMapping("/manual-sales")
    public List<ManualSaleDocumentResponse> listManualSales(@AuthenticationPrincipal UserPrincipal principal) {
        return manualSaleDocumentService.findAll(principal.getUser());
    }

    @PostMapping("/manual-sales")
    @ResponseStatus(HttpStatus.CREATED)
    public ManualSaleDocumentResponse createManualSale(
            @Valid @RequestBody ManualSaleDocumentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return manualSaleDocumentService.create(request, principal.getUser());
    }

    @DeleteMapping("/manual-sales/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteManualSale(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        manualSaleDocumentService.delete(id, principal.getUser());
    }

    private static void validatePeriod(int year, int month) {
        if (year < 2000 || year > 2100 || month < 1 || month > 12) {
            throw new com.adrian.inventory.exception.ApiException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Período inválido");
        }
    }
}
