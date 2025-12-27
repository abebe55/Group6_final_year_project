package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.request.EmailVerificationRequestDto;
import com.northwollo.tourism.dto.response.EmailVerificationResponseDto;
import com.northwollo.tourism.entity.EmailVerificationToken;
import com.northwollo.tourism.entity.User;
import com.northwollo.tourism.repository.EmailVerificationTokenRepository;
import com.northwollo.tourism.repository.UserRepository;
import com.northwollo.tourism.service.EmailService;
import com.northwollo.tourism.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.email-verification.token-expiry-hours:24}")
    private int tokenExpiryHours;

    @Value("${app.email-verification.max-tokens-per-email:3}")
    private int maxTokensPerEmail;

    @Value("${app.email-verification.max-tokens-per-ip-per-hour:5}")
    private int maxTokensPerIpPerHour;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public EmailVerificationResponseDto sendVerificationEmail(EmailVerificationRequestDto request, String ipAddress, String userAgent) {
        String email = request.getEmail().toLowerCase().trim();
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.warn("Email verification requested for non-existent email: {}", email);
            return EmailVerificationResponseDto.error("Email address not found.");
        }

        User user = userOpt.get();
        
        // Check if user is active
        if (!user.isActive()) {
            log.warn("Email verification requested for inactive user: {}", email);
            return EmailVerificationResponseDto.error("Account is inactive. Please contact support.");
        }

        // Check if email is already verified
        if (user.isEmailVerified()) {
            log.info("Email verification requested for already verified email: {}", email);
            return EmailVerificationResponseDto.success("Email is already verified.");
        }

        // Rate limiting checks
        if (!checkRateLimits(email, ipAddress)) {
            log.warn("Rate limit exceeded for email verification. Email: {}, IP: {}", email, ipAddress);
            return EmailVerificationResponseDto.error("Too many verification requests. Please try again later.");
        }

        // Generate secure token
        String token = generateSecureToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(tokenExpiryHours);

        // Create and save verification token
        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user.getId(), email, expiresAt);
        verificationToken.setIpAddress(ipAddress);
        verificationToken.setUserAgent(userAgent);
        emailVerificationTokenRepository.save(verificationToken);

        // Send verification email
        String verificationLink = frontendBaseUrl + "/auth/verify-email?token=" + token;
        boolean emailSent = emailService.sendEmailVerificationEmail(email, verificationLink);

        if (!emailSent) {
            log.error("Failed to send email verification email to: {}", email);
            return EmailVerificationResponseDto.error("Failed to send verification email. Please try again.");
        }

        log.info("Email verification token generated for user: {} from IP: {}", user.getId(), ipAddress);
        return EmailVerificationResponseDto.success("Verification email has been sent. Please check your inbox.");
    }

    @Override
    @Transactional
    public EmailVerificationResponseDto verifyEmail(String token, String ipAddress, String userAgent) {
        // Find and validate token
        Optional<EmailVerificationToken> tokenOpt = emailVerificationTokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            log.warn("Invalid email verification token used from IP: {}", ipAddress);
            return EmailVerificationResponseDto.error("Invalid or expired verification token.");
        }

        EmailVerificationToken verificationToken = tokenOpt.get();
        
        // Check if token is valid (not verified and not expired)
        if (!verificationToken.isValid()) {
            log.warn("Expired or used email verification token: {} from IP: {}", token, ipAddress);
            return EmailVerificationResponseDto.error("Invalid or expired verification token.");
        }

        // Find user
        Optional<User> userOpt = userRepository.findById(verificationToken.getUserId());
        if (userOpt.isEmpty()) {
            log.error("User not found for email verification token: {}", verificationToken.getUserId());
            return EmailVerificationResponseDto.error("Invalid verification token.");
        }

        User user = userOpt.get();

        // Update user email verification status
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(user);

        // Mark token as verified
        verificationToken.markAsVerified();
        emailVerificationTokenRepository.save(verificationToken);

        // Mark all other tokens for this email as verified
        emailVerificationTokenRepository.markAllTokensAsVerifiedByEmail(user.getEmail());

        log.info("Email successfully verified for user: {} from IP: {}", user.getId(), ipAddress);
        return EmailVerificationResponseDto.success("Email has been verified successfully.");
    }

    @Override
    @Transactional
    public EmailVerificationResponseDto resendVerificationEmail(Long userId, String ipAddress, String userAgent) {
        // Find user
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("Resend verification requested for non-existent user: {}", userId);
            return EmailVerificationResponseDto.error("User not found.");
        }

        User user = userOpt.get();
        
        // Check if user is active
        if (!user.isActive()) {
            log.warn("Resend verification requested for inactive user: {}", userId);
            return EmailVerificationResponseDto.error("Account is inactive. Please contact support.");
        }

        // Check if email is already verified
        if (user.isEmailVerified()) {
            log.info("Resend verification requested for already verified user: {}", userId);
            return EmailVerificationResponseDto.success("Email is already verified.");
        }

        // Create request DTO and delegate to sendVerificationEmail
        EmailVerificationRequestDto request = new EmailVerificationRequestDto(user.getEmail());
        return sendVerificationEmail(request, ipAddress, userAgent);
    }

    @Override
    public boolean isEmailVerified(String email) {
        return emailVerificationTokenRepository.isEmailVerified(email.toLowerCase().trim());
    }

    @Override
    public boolean isUserEmailVerified(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(User::isEmailVerified).orElse(false);
    }

    @Override
    public boolean isValidVerificationToken(String token) {
        return emailVerificationTokenRepository.existsValidToken(token, LocalDateTime.now());
    }

    @Override
    @Transactional
    public int cleanupExpiredTokens() {
        int deletedCount = emailVerificationTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Cleaned up {} expired email verification tokens", deletedCount);
        return deletedCount;
    }

    private boolean checkRateLimits(String email, String ipAddress) {
        LocalDateTime now = LocalDateTime.now();
        
        // Check email-based rate limit
        long emailTokenCount = emailVerificationTokenRepository.countValidTokensByEmail(email, now);
        if (emailTokenCount >= maxTokensPerEmail) {
            return false;
        }

        // Check IP-based rate limit
        LocalDateTime oneHourAgo = now.minusHours(1);
        long ipTokenCount = emailVerificationTokenRepository.countTokensByIpAddressSince(ipAddress, oneHourAgo);
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