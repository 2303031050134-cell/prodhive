package com.prodhive_gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {
    @Value("${jwt.secret}")
    private String secret;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (path.equals("/api/register") || path.equals("/api/login") ||
                path.equals("/api/ping") || path.equals("/api/forgot-password") ||
                path.equals("/api/reset-password") || path.equals("/api/verify") ||
                path.equals("/api/auth/register") || path.equals("/api/auth/login") ||
                path.equals("/api/auth/ping") || path.equals("/api/auth/forgot-password") ||
                path.equals("/api/auth/reset-password") || path.equals("/api/auth/verify") ||
                path.startsWith("/api/core/webhooks/") || path.equals("/api/core/github/app/setup") ||
                path.startsWith("/ws/")) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .headers(headers -> { headers.remove("X-User-Email"); headers.remove("X-User-Role"); headers.remove("X-User-Id"); headers.remove("X-Org-Id"); headers.remove("X-Org-Role"); })
                    .header("X-User-Email", claims.getSubject())
                    .header("X-User-Role", claims.get("role", String.class))
                    .header("X-User-Id", String.valueOf(claims.get("userId")))
                    .header("X-Org-Id",	String.valueOf(claims.get("orgId")))
                    .header("X-Org-Role", String.valueOf(claims.get("orgRole")))
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
