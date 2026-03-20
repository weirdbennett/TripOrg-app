package com.triporg.controller;

import com.triporg.dto.UserDto;
import com.triporg.dto.request.LoginRequest;
import com.triporg.dto.request.RegisterRequest;
import com.triporg.dto.response.LoginResponse;
import com.triporg.security.CurrentUser;
import com.triporg.security.UserPrincipal;
import com.triporg.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @GetMapping("/me")
    public ResponseEntity<Map<String, UserDto>> getCurrentUser(@CurrentUser UserPrincipal principal) {
        UserDto user = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(Map.of("user", user));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless, logout is handled client-side
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now log in."));
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(Map.of("message", "Verification email sent. Please check your inbox."));
    }
}


