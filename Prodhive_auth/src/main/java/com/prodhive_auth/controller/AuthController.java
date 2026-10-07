package com.prodhive_auth.controller;

import com.prodhive_auth.dto.AuthResponse;
import com.prodhive_auth.dto.LoginRequest;
import com.prodhive_auth.dto.RegisterRequest;
import com.prodhive_auth.dto.ForgotPasswordRequest;
import com.prodhive_auth.dto.ResetPasswordRequest;
import com.prodhive_auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }


    @GetMapping("/ping")
    public String ping() { return "auth-service is up"; }

    @GetMapping("/verify")
    public ResponseEntity<Void> verify(@RequestParam String token) { authService.verifyEmail(token); return ResponseEntity.ok().build(); }


    @PostMapping("/forgot-password")
    public ResponseEntity<Void>forgotPassword(@RequestBody ForgotPasswordRequest req){
        authService.requestPasswordReset(req.email());
        return	ResponseEntity.ok().build();
    }
    @PostMapping("/reset-password")
    public ResponseEntity<Void>resetPassword(@RequestBody ResetPasswordRequest req){
        authService.resetPassword(req.token(),	req.newPassword());
        return	ResponseEntity.ok().build();
    }

}
