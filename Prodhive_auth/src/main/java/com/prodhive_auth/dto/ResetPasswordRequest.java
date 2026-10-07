package com.prodhive_auth.dto;
public record ResetPasswordRequest(String token, String newPassword) {}
