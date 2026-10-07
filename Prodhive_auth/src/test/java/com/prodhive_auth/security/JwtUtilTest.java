package com.prodhive_auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    @Test
    void generateTokenShouldCreateCompactJwt() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "this-is-a-long-enough-secret-for-jwt-signing-1234567890");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 3_600_000L);

        String token = jwtUtil.generateToken("user@example.com", "ADMIN", 7L, 1L);

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }
}
