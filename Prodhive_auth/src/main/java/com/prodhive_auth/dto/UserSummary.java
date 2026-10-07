package com.prodhive_auth.dto;

/** Minimal, safe-to-expose user info (no password hash) for member pickers / avatars. */
public record UserSummary(Long id, String fullName, String email, String githubUsername) {
}
