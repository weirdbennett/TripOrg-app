package com.triporg.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.frontend-url}")
    private String frontendUrl;
    
    // Send verification email async, so it doesnt slow down registration
    @Async
    public void sendVerificationEmail(String to, String displayName, String token) {
        try {
            // Build the link that user will click to verify their account
            String verificationLink = frontendUrl + "/verify-email?token=" + token;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@triporg.com");
            message.setTo(to);
            message.setSubject("Verify your TripOrg account");
            message.setText(
                "Hello " + displayName + ",\n\n" +
                "Thank you for registering with TripOrg!\n\n" +
                "Please click the link below to verify your email address:\n\n" +
                verificationLink + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not create an account, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The TripOrg Team"
            );
            
            mailSender.send(message);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
        }
    }
    
    // Send password reset email async
    @Async
    public void sendPasswordResetEmail(String to, String displayName, String token) {
        try {
            // Build the link that user will use to set a new password
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@triporg.com");
            message.setTo(to);
            message.setSubject("Reset your TripOrg password");
            message.setText(
                "Hello " + displayName + ",\n\n" +
                "We received a request to reset your password.\n\n" +
                "Click the link below to reset your password:\n\n" +
                resetLink + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The TripOrg Team"
            );
            
            mailSender.send(message);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }
}
