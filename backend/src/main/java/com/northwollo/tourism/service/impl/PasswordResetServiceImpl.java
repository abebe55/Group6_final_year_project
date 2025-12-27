package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.request.PasswordResetConfirmDto;
import com.northwollo.tourism.dto.request.PasswordResetRequestDto;
import com.northwollo.tourism.dto.response.PasswordResetResponseDto;
import com.northwollo.tourism.entity.PasswordResetToken;
import com.northwollo.tourism.entity.User;
import com.northwollo.tourism.exception.BadRequestException;
import com.northwollo.tourism.repository.PasswordResetTokenRepository;
import com.northwollo.tourism.repository.UserRepository;
import com.northwollo.tourism.service.EmailService;
import com.northwollo.tourism.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.token-expiry-hours:1}")
    private int tokenExpiryHours;

    @Value("${app.password-reset.max-tokens-per-user:3}")
    private int maxTokensPerUser;

    @Value("${app.password-reset.max-tokens-per-ip-per-hour:5}")
    private int maxTokensPerIpPerHour;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public PasswordResetResponseDto initiatePasswordReset(PasswordResetRequestDto request, String ipAddress, String userAgent) {
        String email = request.getEmail().toLowerCase().trim();
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists or not for security
            log.warn("Password reset requested for non-existent email: {}", email);
            return PasswordResetResponseDto.success("If the email exists, a reset link has been sent.");
        }

        User user = userOpt.get();
        
        // Check if user is active
        if (!user.isActive()) {
            log.warn("Password reset requested for inactive user: {}", email);
            return PasswordResetResponseDto.error("Account is inactive. Please contact support.");
        }

        // Rate limiting checks
        if (!checkRateLimits(user.getId(), ipAddress)) {
            log.warn("Rate limit exceeded for password reset. User: {}, IP: {}", user.getId(), ipAddress);
            return PasswordResetResponseDto.error("Too many reset requests. Please try again later.");
        }

        // Generate secure token
        String token = generateSecureToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(tokenExpiryHours);

        // Create and save reset token
        PasswordResetToken resetToken = new PasswordResetToken(token, user.getId(), expiresAt);
        resetToken.setIpAddress(ipAddress);
        resetToken.setUserAgent(userAgent);
        passwordResetTokenRepository.save(resetToken);

        // Send reset email
        String resetLink = frontendBaseUrl + "/auth/reset-password?token=" + token;
        boolean emailSent = emailService.sendPasswordResetEmail(email, resetLink);

        if (!emailSent) {
            log.error("Failed to send password reset email to: {}", email);
            return PasswordResetResponseDto.error("Failed to send reset email. Please try again.");
        }

        log.info("Password reset token generated for user: {} from IP: {}", user.getId(), ipAddress);
        return PasswordResetResponseDto.success("If the email exists, a reset link has been sent.");
    }

    @Override
    @Transactional
    public PasswordResetResponseDto confirmPasswordReset(PasswordResetConfirmDto request, String ipAddress, String userAgent) {
        String token = request.getToken();
        String newPassword = request.getNewPassword();

        // Find and validate token
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            log.warn("Invalid password reset token used from IP: {}", ipAddress);
            return PasswordResetResponseDto.error("Invalid or expired reset token.");
        }

        PasswordResetToken resetToken = tokenOpt.get();
        
        // Check if token is valid (not used and not expired)
        if (!resetToken.isValid()) {
            log.warn("Expired or used password reset token: {} from IP: {}", token, ipAddress);
            return PasswordResetResponseDto.error("Invalid or expired reset token.");
        }

        // Find user
        Optional<User> userOpt = userRepository.findById(resetToken.getUserId());
        if (userOpt.isEmpty()) {
            log.error("User not found for password reset token: {}", resetToken.getUserId());
            return PasswordResetResponseDto.error("Invalid reset token.");
        }

        User user = userOpt.get();

        // Update user password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.markAsUsed();
        passwordResetTokenRepository.save(resetToken);

        // Invalidate all other tokens for this user
        passwordResetTokenRepository.markAllTokensAsUsedByUserId(user.getId());

        log.info("Password successfully reset for user: {} from IP: {}", user.getId(), ipAddress);
        return PasswordResetResponseDto.success("Password has been reset successfully.");
    }

    @Override
    public boolean isValidResetToken(String token) {
        return passwordResetTokenRepository.existsValidToken(token, LocalDateTime.now());
    }

    @Override
    @Transactional
    public int cleanupExpiredTokens() {
        int deletedCount = passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Cleaned up {} expired password reset tokens", deletedCount);
        return deletedCount;
    }

    private boolean checkRateLimits(Long userId, String ipAddress) {
        LocalDateTime now = LocalDateTime.now();
        
        // Check user-based rate limit
        long userTokenCount = passwordResetTokenRepository.countValidTokensByUserId(userId, now);
        if (userTokenCount >= maxTokensPerUser) {
            return false;
        }

        // Check IP-based rate limit
        LocalDateTime oneHourAgo = now.minusHours(1);
        long ipTokenCount = passwordResetTokenRepository.countTokensByIpAddressSince(ipAddress, oneHourAgo);
        if (ipTokenCount >= maxTokensPerIpPerHour) {
            return false;
        }

        return true;
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32]; // 256 bits
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}