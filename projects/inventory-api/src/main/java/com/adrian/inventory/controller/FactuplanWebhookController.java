package com.adrian.inventory.controller;

import com.adrian.inventory.service.FactuplanWebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/factuplan")
public class FactuplanWebhookController {

    private final FactuplanWebhookService webhookService;

    public FactuplanWebhookController(FactuplanWebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping
    public ResponseEntity<Void> handle(
            @RequestBody String body,
            @RequestHeader(value = "x-factuplan-signature", required = false) String signature) {
        webhookService.handle(body, signature);
        return ResponseEntity.ok().build();
    }
}
