package com.prodhive_auth.dto;

public record AuthResponse(String token, Long userId, String email, String fullName, String role, Long orgId) {

}