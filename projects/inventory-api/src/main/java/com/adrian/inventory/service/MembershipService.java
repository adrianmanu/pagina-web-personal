package com.adrian.inventory.service;

import com.adrian.inventory.config.MembershipProperties;
import com.adrian.inventory.dto.MembershipPlanResponse;
import com.adrian.inventory.dto.MembershipStatusResponse;
import com.adrian.inventory.model.*;
import com.adrian.inventory.repository.MembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final MembershipProperties membershipProperties;

    public MembershipService(MembershipRepository membershipRepository, MembershipProperties membershipProperties) {
        this.membershipRepository = membershipRepository;
        this.membershipProperties = membershipProperties;
    }

    @Transactional
    public Membership getOrCreate(User user) {
        return membershipRepository.findByUserId(user.getId()).orElseGet(() -> startTrial(user));
    }

    @Transactional
    public Membership startTrial(User user) {
        LocalDateTime now = LocalDateTime.now();
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setPlan(MembershipPlan.TRIAL);
        membership.setStatus(MembershipStatus.TRIAL);
        membership.setProvider(BillingProvider.MANUAL);
        membership.setTrialEndsAt(now.plusDays(membershipProperties.getTrialDays()));
        membership.setCreatedAt(now);
        membership.setUpdatedAt(now);
        return membershipRepository.save(membership);
    }

    public MembershipStatusResponse getStatus(User user) {
        Membership membership = getOrCreate(user);
        boolean canEmit = canEmit(membership);
        String message = statusMessage(membership, canEmit);
        return MembershipStatusResponse.from(
                membership,
                canEmit,
                membershipProperties.isEnforcementEnabled(),
                message);
    }

    public List<MembershipPlanResponse> listPlans() {
        return List.of(
                new MembershipPlanResponse(
                        MembershipPlan.STARTER,
                        "Starter",
                        "Ideal para negocios que empiezan a facturar electrónicamente con el SRI.",
                        MembershipPricing.monthlyPriceUsd(MembershipPlan.STARTER),
                        List.of(
                                "Control de inventario y productos",
                                "Facturas electrónicas SRI (autorizadas)",
                                "Notas de crédito y notas de débito",
                                "Guías de remisión",
                                "Comprobantes de retención",
                                "Motor SRI Factuplan incluido (sin contrato aparte)",
                                "Asistente de conexión SRI (RUC, certificado, punto de emisión)",
                                "Clientes y catálogo para facturar más rápido",
                                "1 usuario",
                                "Soporte por correo (48 h hábiles)"),
                        true,
                        MembershipPricing.billingOptions(MembershipPlan.STARTER)),
                new MembershipPlanResponse(
                        MembershipPlan.PRO,
                        "Pro",
                        "Para contadores y negocios que necesitan más comprobantes y reportes.",
                        MembershipPricing.monthlyPriceUsd(MembershipPlan.PRO),
                        List.of(
                                "Todo lo incluido en Starter",
                                "Exportación ATS (anexo transaccional SRI)",
                                "Liquidaciones de compra",
                                "Documentos recibidos del SRI",
                                "Proformas comerciales",
                                "Múltiples usuarios con roles (admin y operador)",
                                "Retenciones y comprobantes avanzados",
                                "Soporte prioritario (24 h hábiles)"),
                        false,
                        MembershipPricing.billingOptions(MembershipPlan.PRO)));
    }

    public boolean canEmit(User user) {
        if (!membershipProperties.isEnforcementEnabled()) {
            return true;
        }
        return canEmit(getOrCreate(user));
    }

    public boolean canEmit(Membership membership) {
        if (!membershipProperties.isEnforcementEnabled()) {
            return true;
        }
        LocalDateTime now = LocalDateTime.now();

        if (membership.getStatus() == MembershipStatus.TRIAL) {
            return membership.getTrialEndsAt() != null && membership.getTrialEndsAt().isAfter(now);
        }
        if (membership.getStatus() == MembershipStatus.ACTIVE) {
            return membership.getCurrentPeriodEnd() == null || membership.getCurrentPeriodEnd().isAfter(now);
        }
        return false;
    }

    @Transactional
    public void activateFromPayphone(Membership membership, MembershipPlan plan, Long transactionId, int periodDays) {
        LocalDateTime now = LocalDateTime.now();
        membership.setPlan(plan);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setProvider(BillingProvider.PAYPHONE);
        membership.setStripeCustomerId(null);
        membership.setStripeSubscriptionId(transactionId != null ? transactionId.toString() : null);
        membership.setCurrentPeriodEnd(now.plusDays(periodDays));
        membership.setUpdatedAt(now);
        membershipRepository.save(membership);
    }

    @Transactional
    public void activateFromStripe(
            Membership membership,
            MembershipPlan plan,
            String customerId,
            String subscriptionId,
            LocalDateTime periodEnd) {
        membership.setPlan(plan);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setProvider(BillingProvider.STRIPE);
        membership.setStripeCustomerId(customerId);
        membership.setStripeSubscriptionId(subscriptionId);
        membership.setCurrentPeriodEnd(periodEnd);
        membership.setUpdatedAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    @Transactional
    public void markPastDue(Membership membership) {
        membership.setStatus(MembershipStatus.PAST_DUE);
        membership.setUpdatedAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    @Transactional
    public void suspend(Membership membership) {
        membership.setStatus(MembershipStatus.SUSPENDED);
        membership.setUpdatedAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    @Transactional
    public void cancel(Membership membership) {
        membership.setStatus(MembershipStatus.CANCELLED);
        membership.setStripeSubscriptionId(null);
        membership.setUpdatedAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    @Transactional
    public void refreshPeriodEnd(Membership membership, MembershipStatus status, LocalDateTime periodEnd) {
        membership.setStatus(status);
        membership.setCurrentPeriodEnd(periodEnd);
        membership.setUpdatedAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    private String statusMessage(Membership membership, boolean canEmit) {
        if (!membershipProperties.isEnforcementEnabled()) {
            return "Cobro de membresía desactivado en este servidor (modo desarrollo)";
        }
        if (canEmit && membership.getStatus() == MembershipStatus.TRIAL) {
            return "Periodo de prueba activo hasta " + membership.getTrialEndsAt();
        }
        if (canEmit && membership.getStatus() == MembershipStatus.ACTIVE) {
            return "Membresía activa";
        }
        return switch (membership.getStatus()) {
            case PAST_DUE -> "Pago pendiente — renueva tu membresía para seguir emitiendo comprobantes";
            case SUSPENDED, CANCELLED -> "Membresía suspendida — activa un plan para emitir comprobantes SRI";
            case TRIAL -> "Periodo de prueba vencido — elige un plan para continuar";
            default -> "Membresía inactiva";
        };
    }
}
