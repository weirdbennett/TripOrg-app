package com.triporg.service;

import com.triporg.dto.UserDto;
import com.triporg.dto.request.LoginRequest;
import com.triporg.dto.request.RegisterRequest;
import com.triporg.dto.response.LoginResponse;
import com.triporg.entity.User;
import com.triporg.exception.BadRequestException;
import com.triporg.exception.UnauthorizedException;
import com.triporg.mapper.EntityMapper;
import com.triporg.repository.UserRepository;
import com.triporg.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final EntityMapper mapper;
    
    // Create a new user account and send verification email
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if email is already taken
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        
        // Generate a unique token for email verification (valid for 24 hours)
        String verificationToken = UUID.randomUUID().toString();
        Instant tokenExpiry = Instant.now().plus(24, ChronoUnit.HOURS);
        
        // Create new user with all initial settings
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .displayName(request.getDisplayName())
                .preferredCurrency("USD")
                .themePreference("light")
                .emailVerified(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(tokenExpiry)
                .build();
        
        user = userRepository.save(user);
        
        // Send email with verification link
        emailService.sendVerificationEmail(user.getEmail(), user.getDisplayName(), verificationToken);
        log.info("User registered, verification email sent: {}", user.getEmail());
        
        // Generate JWT token for immediate login
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        
        return LoginResponse.builder()
                .user(mapper.toUserDto(user))
                .token(token)
                .build();
    }
    
    // Check credentials and log user in if everything is valid
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        
        // Verify password matches
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        // User must verify their email before they can actually log in
        if (!user.getEmailVerified()) {
            throw new UnauthorizedException("Please verify your email address before logging in. Check your inbox for the verification link.");
        }
        
        // Generate token for authenticated session
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        
        return LoginResponse.builder()
                .user(mapper.toUserDto(user))
                .token(token)
                .build();
    }
    
    // Fetch current logged in user's info
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return mapper.toUserDto(user);
    }
    
    // Mark email as verified when user clicks the email link
    @Transactional
    public void verifyEmail(String token) {
        // Find user by their verification token
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        
        // Check if already verified
        if (user.getEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        
        // Check if token hasnt expired
        if (user.getVerificationTokenExpiry() == null || 
            Instant.now().isAfter(user.getVerificationTokenExpiry())) {
            throw new BadRequestException("Verification token has expired. Please request a new one.");
        }
        
        // Mark email as verified and clean up the token
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        
        log.info("Email verified for user: {}", user.getEmail());
    }
    
    // Send a fresh verification email if user lost or didn't receive the first one
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        // if already verified, no need to send another email
        if (user.getEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        
        // Create a new verification token (old one is useless now)
        String verificationToken = UUID.randomUUID().toString();
        Instant tokenExpiry = Instant.now().plus(24, ChronoUnit.HOURS);
        
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(tokenExpiry);
        userRepository.save(user);
        
        // Send the email with new token
        emailService.sendVerificationEmail(user.getEmail(), user.getDisplayName(), verificationToken);
        log.info("Verification email resent to: {}", user.getEmail());
    }
}


