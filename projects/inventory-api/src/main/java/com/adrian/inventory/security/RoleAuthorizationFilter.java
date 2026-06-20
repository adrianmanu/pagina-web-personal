package com.adrian.inventory.security;

import com.adrian.inventory.model.UserRole;
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
public class RoleAuthorizationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            filterChain.doFilter(request, response);
            return;
        }

        String method = request.getMethod();
        String path = request.getRequestURI();
        UserRole role = principal.getRole();

        if (role == UserRole.CONTADOR && isWriteMethod(method) && !isAccountantWriteAllowed(path, method)) {
            deny(response, "El rol contador solo puede consultar y exportar ATS");
            return;
        }

        if (role == UserRole.CAJERO && isWriteMethod(method) && isCashierWriteDenied(path)) {
            deny(response, "El rol cajero no tiene permiso para esta operación");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static boolean isWriteMethod(String method) {
        return HttpMethod.POST.matches(method)
                || HttpMethod.PUT.matches(method)
                || HttpMethod.DELETE.matches(method)
                || HttpMethod.PATCH.matches(method);
    }

    private static boolean isAccountantWriteAllowed(String path, String method) {
        return path.startsWith("/api/ats/export");
    }

    private static boolean isCashierWriteDenied(String path) {
        return path.startsWith("/api/settings")
                || path.startsWith("/api/ats/export")
                || path.startsWith("/api/ats/manual-sales");
    }

    private static void deny(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"detail\":\"" + message + "\"}");
    }
}
