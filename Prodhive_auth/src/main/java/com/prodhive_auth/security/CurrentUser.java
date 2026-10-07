package com.prodhive_auth.security;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
@Component
public class CurrentUser {
    public Long getUserId(HttpServletRequest request) { return Long.valueOf(request.getHeader("X-User-Id")); }
}
