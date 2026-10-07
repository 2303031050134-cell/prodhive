package com.prodhive_core.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
@Component
public class CurrentUser {
    public Long getUserId(HttpServletRequest request) {
        return Long.valueOf(request.getHeader("X-User-Id"));
    }
    public String getRole(HttpServletRequest request) {
        return request.getHeader("X-User-Role");
    }
    public Long getOrganizationId(HttpServletRequest request) {
        String value = request.getHeader("X-Org-Id");
        return value == null || "null".equals(value) ? null : Long.valueOf(value);
    }

    /** The caller's role WITHIN the active organization (OWNER/ADMIN/MEMBER) — distinct from getRole(), which is their global account role. */
    public String getOrgRole(HttpServletRequest request) {
        String value = request.getHeader("X-Org-Role");
        return value == null || "null".equals(value) ? null : value;
    }
}
