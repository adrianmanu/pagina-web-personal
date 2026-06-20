package com.adrian.inventory.security;

import com.adrian.inventory.service.MembershipService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class MembershipEnforcementFilter extends OncePerRequestFilter {

    private final MembershipService membershipService;

    public MembershipEnforcementFilter(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            String method = request.getMethod();
            String path = request.getRequestURI();
            if (isBillingWrite(method, path) && !membershipService.canEmit(principal.getUser())) {
                deny(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private static boolean isBillingWrite(String method, String path) {
        if (!isWriteMethod(method)) {
            return false;
        }
        return path.startsWith("/api/invoices")
                || path.startsWith("/api/credit-notes")
                || path.startsWith("/api/debit-notes")
                || path.startsWith("/api/waybills")
                || path.startsWith("/api/retentions")
                || path.startsWith("/api/purchase-settlements")
                || path.startsWith("/api/proformas");
    }

    private static boolean isWriteMethod(String method) {
        return HttpMethod.POST.matches(method)
                || HttpMethod.PUT.matches(method)
                || HttpMethod.PATCH.matches(method)
                || HttpMethod.DELETE.matches(method);
    }

    private static void deny(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_PAYMENT_REQUIRED);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"detail\":\"Membresía inactiva o vencida. Activa un plan en /membresia para emitir comprobantes SRI.\"}");
    }
}
