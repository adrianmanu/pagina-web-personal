package com.adrian.inventory.controller;

import com.adrian.inventory.config.PayPhoneProperties;
import com.adrian.inventory.config.StripeProperties;
import com.adrian.inventory.dto.CheckoutRequest;
import com.adrian.inventory.dto.CheckoutSessionResponse;
import com.adrian.inventory.dto.MembershipPlanResponse;
import com.adrian.inventory.dto.MembershipStatusResponse;
import com.adrian.inventory.dto.PayPhoneConfirmRequest;
import com.adrian.inventory.dto.PayPhoneConfirmResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.MembershipService;
import com.adrian.inventory.service.PayPhoneMembershipService;
import com.adrian.inventory.service.StripeMembershipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership")
public class MembershipController {

    private final MembershipService membershipService;
    private final PayPhoneMembershipService payPhoneMembershipService;
    private final StripeMembershipService stripeMembershipService;
    private final PayPhoneProperties payPhoneProperties;
    private final StripeProperties stripeProperties;

    public MembershipController(
            MembershipService membershipService,
            PayPhoneMembershipService payPhoneMembershipService,
            StripeMembershipService stripeMembershipService,
            PayPhoneProperties payPhoneProperties,
            StripeProperties stripeProperties) {
        this.membershipService = membershipService;
        this.payPhoneMembershipService = payPhoneMembershipService;
        this.stripeMembershipService = stripeMembershipService;
        this.payPhoneProperties = payPhoneProperties;
        this.stripeProperties = stripeProperties;
    }

    @GetMapping("/status")
    public MembershipStatusResponse status(@AuthenticationPrincipal UserPrincipal principal) {
        return membershipService.getStatus(principal.getUser());
    }

    @GetMapping("/plans")
    public List<MembershipPlanResponse> plans() {
        return membershipService.listPlans();
    }

    @GetMapping("/billing-provider")
    public BillingProviderResponse billingProvider() {
        if (payPhoneProperties.isConfigured()) {
            return new BillingProviderResponse("payphone", true);
        }
        if (stripeProperties.isConfigured()) {
            return new BillingProviderResponse("stripe", true);
        }
        return new BillingProviderResponse("manual", false);
    }

    @PostMapping("/checkout")
    public CheckoutSessionResponse checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request) {
        if (payPhoneProperties.isConfigured()) {
            return payPhoneMembershipService.prepareCheckout(
                    principal.getUser(), request.plan(), request.periodMonths());
        }
        if (stripeProperties.isConfigured()) {
            return stripeMembershipService.createCheckoutSession(principal.getUser(), request.plan());
        }
        throw new ApiException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Ningún proveedor de pago configurado. Activa PayPhone o Stripe en el servidor.");
    }

    @PostMapping("/confirm")
    public PayPhoneConfirmResponse confirm(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PayPhoneConfirmRequest request) {
        return payPhoneMembershipService.confirmPayment(
                principal.getUser(), request.id(), request.clientTxId());
    }

    public record BillingProviderResponse(String provider, boolean paymentsEnabled) {}
}
