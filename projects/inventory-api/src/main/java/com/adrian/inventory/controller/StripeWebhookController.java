package com.adrian.inventory.controller;

import com.adrian.inventory.service.StripeMembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/stripe")
public class StripeWebhookController {

    private final StripeMembershipService stripeMembershipService;

    public StripeWebhookController(StripeMembershipService stripeMembershipService) {
        this.stripeMembershipService = stripeMembershipService;
    }

    @PostMapping
    public ResponseEntity<Void> handle(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {
        stripeMembershipService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
