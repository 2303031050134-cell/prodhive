package com.prodhive_auth.service;

import com.prodhive_auth.dto.*;
import com.prodhive_auth.entity.*;
import com.prodhive_auth.repository.*;
import com.prodhive_auth.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtUtil jwt;
    private final VerificationTokenRepository verificationTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final OrganizationMemberRepository orgMembers;

    public AuthService(UserRepository users, PasswordEncoder passwords, JwtUtil jwt,
                       VerificationTokenRepository verificationTokens, PasswordResetTokenRepository resetTokens,
                       OrganizationMemberRepository orgMembers) {
        this.users = users; this.passwords = passwords; this.jwt = jwt;
        this.verificationTokens = verificationTokens; this.resetTokens = resetTokens; this.orgMembers = orgMembers;
    }
    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.email())) throw new IllegalArgumentException("Email already registered");
        User user = new User();
        user.setEmail(req.email()); user.setPasswordHash(passwords.encode(req.password())); user.setFullName(req.fullName());
        user.setRole(Role.MEMBER); 
        users.save(user);
        VerificationToken verification = new VerificationToken();
        verification.setToken(UUID.randomUUID().toString()); verification.setUserId(user.getId());
        verification.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS)); verificationTokens.save(verification);
        return response(user);
    }
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(req.email()).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwords.matches(req.password(), user.getPasswordHash())) throw new IllegalArgumentException("Invalid credentials");
        return response(user);
    }
    private AuthResponse response(User user) {
        OrganizationMember membership = orgMembers.findByUserId(user.getId()).stream().findFirst().orElse(null);
        Long orgId = membership == null ? null : membership.getOrganization().getId();
        String orgRole = membership == null ? null : membership.getRole().name();
        String token = jwt.generateToken(user.getEmail(), user.getRole().name(), user.getId(), orgId, orgRole);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), orgId);
    }
    public void verifyEmail(String token) {
        VerificationToken item = verificationTokens.findByToken(token).orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));
        if (item.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Token expired");
        User user = users.findById(item.getUserId()).orElseThrow(); user.setEmailVerified(true); users.save(user); verificationTokens.delete(item);
    }
    public void requestPasswordReset(String email) {
        User user = users.findByEmail(email).orElse(null); if (user == null) return;
        PasswordResetToken item = new PasswordResetToken(); item.setToken(UUID.randomUUID().toString()); item.setUserId(user.getId());
        item.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS)); resetTokens.save(item);
        
    }
    public void resetPassword(String token, String password) {
        PasswordResetToken item = resetTokens.findByToken(token).orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));
        if (item.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Token expired");
        User user = users.findById(item.getUserId()).orElseThrow(); user.setPasswordHash(passwords.encode(password)); users.save(user); resetTokens.delete(item);
    }
}
