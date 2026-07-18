package com.adrian.inventory.service;

import com.adrian.inventory.config.StripeProperties;
import com.adrian.inventory.dto.CheckoutSessionResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.*;
import com.adrian.inventory.repository.MembershipRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;

@Service
public class StripeMembershipService {

    private final StripeProperties stripeProperties;
    private final MembershipRepository membershipRepository;
    private final MembershipService membershipService;

    public StripeMembershipService(
            StripeProperties stripeProperties,
            MembershipRepository membershipRepository,
            MembershipService membershipService) {
        this.stripeProperties = stripeProperties;
        this.membershipRepository = membershipRepository;
        this.membershipService = membershipService;
        if (stripeProperties.isConfigured()) {
            Stripe.apiKey = stripeProperties.getApiKey();
        }
    }

    public CheckoutSessionResponse createCheckoutSession(User user, MembershipPlan plan) {
        requireStripe();
        if (plan != MembershipPlan.STARTER && plan != MembershipPlan.PRO) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Plan no válido para checkout");
        }

        Membership membership = membershipService.getOrCreate(user);
        String priceId = plan == MembershipPlan.PRO
                ? stripeProperties.getPricePro()
                : stripeProperties.getPriceStarter();
        if (priceId == null || priceId.isBlank()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Precio Stripe no configurado para el plan " + plan);
        }

        try {
            SessionCreateParams.Builder params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setSuccessUrl(stripeProperties.getSuccessUrl())
                    .setCancelUrl(stripeProperties.getCancelUrl())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(priceId)
                            .setQuantity(1L)
                            .build())
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("plan", plan.name())
                    .setClientReferenceId(user.getId().toString());

            if (membership.getStripeCustomerId() != null && !membership.getStripeCustomerId().isBlank()) {
                params.setCustomer(membership.getStripeCustomerId());
            } else {
                params.setCustomerEmail(user.getEmail());
            }

            Session session = Session.create(params.build());
            return CheckoutSessionResponse.stripe(session.getUrl(), "Redirige al usuario a Stripe Checkout");
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "No se pudo crear la sesión de pago: " + ex.getMessage());
        }
    }

    @Transactional
    public void handleWebhook(String payload, String signatureHeader) {
        requireWebhookSecret();
        Event event;
        try {
            event = Webhook.constructEvent(payload, signatureHeader, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Firma webhook Stripe inválida");
        }

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(event);
            case "invoice.payment_failed" -> handlePaymentFailed(event);
            default -> {
                // ignorar otros eventos
            }
        }
    }

    private void handleCheckoutCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .filter(Session.class::isInstance)
                .map(Session.class::cast)
                .orElse(null);
        if (session == null) {
            return;
        }

        Long userId = parseUserId(session.getClientReferenceId(), session.getMetadata());
        if (userId == null) {
            return;
        }

        Membership membership = membershipRepository.findByUserId(userId).orElse(null);
        if (membership == null) {
            return;
        }

        MembershipPlan plan = parsePlan(session.getMetadata());
        membershipService.activateFromStripe(
                membership,
                plan,
                session.getCustomer(),
                session.getSubscription(),
                null);
    }

    private void handleSubscriptionUpdated(Event event) {
        Subscription subscription = deserialize(event, Subscription.class);
        if (subscription == null) {
            return;
        }

        Membership membership = membershipRepository
                .findByStripeSubscriptionId(subscription.getId())
                .or(() -> membershipRepository.findByStripeCustomerId(subscription.getCustomer()))
                .orElse(null);
        if (membership == null) {
            return;
        }

        MembershipStatus status = mapStripeStatus(subscription.getStatus());
        LocalDateTime periodEnd = epochToLocal(subscription.getCurrentPeriodEnd());
        membershipService.refreshPeriodEnd(membership, status, periodEnd);
    }

    private void handleSubscriptionDeleted(Event event) {
        Subscription subscription = deserialize(event, Subscription.class);
        if (subscription == null) {
            return;
        }
        membershipRepository.findByStripeSubscriptionId(subscription.getId())
                .ifPresent(membershipService::cancel);
    }

    private void handlePaymentFailed(Event event) {
        Invoice invoice = deserialize(event, Invoice.class);
        if (invoice == null || invoice.getCustomer() == null) {
            return;
        }
        membershipRepository.findByStripeCustomerId(invoice.getCustomer())
                .ifPresent(membershipService::markPastDue);
    }

    private MembershipStatus mapStripeStatus(String stripeStatus) {
        if (stripeStatus == null) {
            return MembershipStatus.SUSPENDED;
        }
        return switch (stripeStatus) {
            case "active", "trialing" -> MembershipStatus.ACTIVE;
            case "past_due", "unpaid" -> MembershipStatus.PAST_DUE;
            case "canceled", "incomplete_expired" -> MembershipStatus.CANCELLED;
            default -> MembershipStatus.SUSPENDED;
        };
    }

    private static Long parseUserId(String clientReferenceId, Map<String, String> metadata) {
        if (clientReferenceId != null && !clientReferenceId.isBlank()) {
            try {
                return Long.parseLong(clientReferenceId.trim());
            } catch (NumberFormatException ignored) {
                // fallback metadata
            }
        }
        if (metadata != null && metadata.containsKey("userId")) {
            try {
                return Long.parseLong(metadata.get("userId"));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private static MembershipPlan parsePlan(Map<String, String> metadata) {
        if (metadata == null || !metadata.containsKey("plan")) {
            return MembershipPlan.STARTER;
        }
        try {
            return MembershipPlan.valueOf(metadata.get("plan"));
        } catch (IllegalArgumentException ex) {
            return MembershipPlan.STARTER;
        }
    }

    private static LocalDateTime epochToLocal(Long epochSeconds) {
        if (epochSeconds == null) {
            return null;
        }
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneOffset.UTC);
    }

    @SuppressWarnings("unchecked")
    private static <T> T deserialize(Event event, Class<T> type) {
        return event.getDataObjectDeserializer()
                .getObject()
                .filter(type::isInstance)
                .map(type::cast)
                .orElse(null);
    }

    private void requireStripe() {
        if (!stripeProperties.isConfigured()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Stripe no configurado. Defina STRIPE_ENABLED=true y STRIPE_API_KEY en el servidor.");
        }
    }

    private void requireWebhookSecret() {
        if (stripeProperties.getWebhookSecret() == null || stripeProperties.getWebhookSecret().isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "STRIPE_WEBHOOK_SECRET no configurado");
        }
    }
}
