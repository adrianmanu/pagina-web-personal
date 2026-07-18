package com.adrian.inventory.service;

import com.adrian.inventory.config.PayPhoneProperties;
import com.adrian.inventory.dto.CheckoutSessionResponse;
import com.adrian.inventory.dto.MembershipStatusResponse;
import com.adrian.inventory.dto.PayPhoneConfirmResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.integration.payphone.PayPhoneClient;
import com.adrian.inventory.model.*;
import com.adrian.inventory.repository.MembershipPaymentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PayPhoneMembershipService {

    private final PayPhoneProperties payPhoneProperties;
    private final MembershipPaymentRepository paymentRepository;
    private final MembershipService membershipService;
    private final PayPhoneClient payPhoneClient;

    public PayPhoneMembershipService(
            PayPhoneProperties payPhoneProperties,
            MembershipPaymentRepository paymentRepository,
            MembershipService membershipService,
            PayPhoneClient payPhoneClient) {
        this.payPhoneProperties = payPhoneProperties;
        this.paymentRepository = paymentRepository;
        this.membershipService = membershipService;
        this.payPhoneClient = payPhoneClient;
    }

    @Transactional
    public CheckoutSessionResponse prepareCheckout(User user, MembershipPlan plan, int periodMonths) {
        requirePayPhone();
        if (plan != MembershipPlan.STARTER && plan != MembershipPlan.PRO) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Plan no válido para checkout");
        }

        MembershipBillingPeriod period = MembershipBillingPeriod.fromMonths(periodMonths)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST, "Período no válido. Usa 1, 3, 6 o 12 meses."));

        int amountCents = MembershipPricing.amountCents(plan, period);
        String clientTransactionId = buildClientTransactionId();

        MembershipPayment payment = new MembershipPayment();
        payment.setUserId(user.getId());
        payment.setPlan(plan);
        payment.setAmountCents(amountCents);
        payment.setPeriodDays(period.getDays());
        payment.setStatus(MembershipPaymentStatus.PENDING);
        payment.setClientTransactionId(clientTransactionId);
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        String reference = "StockFlow " + plan.name() + " " + period.getLabel();
        JsonNode prepareResult = payPhoneClient.prepareTransaction(clientTransactionId, amountCents, reference);
        String payUrl = textOrEmpty(prepareResult, "payWithCard");
        if (payUrl.isBlank()) {
            payUrl = textOrEmpty(prepareResult, "payWithPayPhone");
        }
        if (payUrl.isBlank()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "PayPhone no devolvió URL de pago");
        }

        return CheckoutSessionResponse.payphoneRedirect(payUrl, "Redirige a PayPhone para completar el pago");
    }

    @Transactional
    public PayPhoneConfirmResponse confirmPayment(User user, long payphoneId, String clientTxId) {
        requirePayPhone();
        if (clientTxId == null || clientTxId.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "clientTxId requerido");
        }

        MembershipPayment payment = paymentRepository
                .findByClientTransactionId(clientTxId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pago no encontrado"));

        if (!payment.getUserId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "El pago no pertenece a tu cuenta");
        }

        if (payment.getStatus() == MembershipPaymentStatus.APPROVED) {
            MembershipStatusResponse status = membershipService.getStatus(user);
            return new PayPhoneConfirmResponse(true, "Approved", "Membresía ya activa", status);
        }

        JsonNode result = payPhoneClient.confirmTransaction(payphoneId, clientTxId);
        String transactionStatus = textOrEmpty(result, "transactionStatus");
        boolean approved = "Approved".equalsIgnoreCase(transactionStatus);

        if (approved) {
            payment.setStatus(MembershipPaymentStatus.APPROVED);
            payment.setPayphoneTransactionId(payphoneId);
            payment.setConfirmedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            Membership membership = membershipService.getOrCreate(user);
            membershipService.activateFromPayphone(
                    membership, payment.getPlan(), payphoneId, payment.getPeriodDays());
        } else {
            payment.setStatus(MembershipPaymentStatus.FAILED);
            paymentRepository.save(payment);
        }

        int days = payment.getPeriodDays();
        String message = approved
                ? "Pago aprobado. Membresía activa por " + days + " días."
                : "Pago no aprobado: " + transactionStatus;
        MembershipStatusResponse status = membershipService.getStatus(user);
        return new PayPhoneConfirmResponse(approved, transactionStatus, message, status);
    }

    private void requirePayPhone() {
        if (!payPhoneProperties.isConfigured()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "PayPhone no configurado. Defina PAYPHONE_ENABLED=true y PAYPHONE_TOKEN en el servidor.");
        }
    }

    private String buildClientTransactionId() {
        String suffix = Long.toHexString(System.nanoTime()).toUpperCase();
        if (suffix.length() > 10) {
            suffix = suffix.substring(suffix.length() - 10);
        }
        return ("SF" + String.format("%10s", suffix).replace(' ', '0')).substring(0, 12);
    }

    private String textOrEmpty(JsonNode node, String field) {
        return node != null && node.hasNonNull(field) ? node.get(field).asText() : "";
    }
}
