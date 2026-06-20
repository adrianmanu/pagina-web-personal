package com.adrian.inventory.controller;

import com.adrian.inventory.dto.SriCertificateStatusResponse;
import com.adrian.inventory.dto.SriCertificateUploadResponse;
import com.adrian.inventory.dto.SriConfigResponse;
import com.adrian.inventory.dto.SriConnectionVerifyResponse;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.SriConnectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/settings/sri")
public class SriConnectionController {

    private final SriConnectionService sriConnectionService;

    public SriConnectionController(SriConnectionService sriConnectionService) {
        this.sriConnectionService = sriConnectionService;
    }

    @GetMapping("/config")
    public SriConfigResponse getConfig(@AuthenticationPrincipal UserPrincipal principal) {
        return sriConnectionService.getConfig(principal.getUser());
    }

    @GetMapping("/certificate/status")
    public SriCertificateStatusResponse certificateStatus(@AuthenticationPrincipal UserPrincipal principal) {
        return sriConnectionService.getCertificateStatus(principal.getUser());
    }

    @PostMapping(value = "/certificate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public SriCertificateUploadResponse uploadCertificate(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("file") MultipartFile file,
            @RequestParam("password") String password) {
        return sriConnectionService.uploadCertificate(principal.getUser(), file, password);
    }

    @PostMapping("/verify")
    public SriConnectionVerifyResponse verify(@AuthenticationPrincipal UserPrincipal principal) {
        return sriConnectionService.verifyConnection(principal.getUser());
    }
}
