package com.northwollo.tourism.service;

import com.northwollo.tourism.dto.request.EmailVerificationRequestDto;
import com.northwollo.tourism.dto.response.EmailVerificationResponseDto;

public interface EmailVerificationService {

    /**
     * Send email verification token to user's email
     * @param request Contains the email address
     * @param ipAddress Client IP address for security tracking
     * @param userAgent Client user agent for security tracking
     * @return Response indicating success or failure
     */
    EmailVerificationResponseDto sendVerificationEmail(EmailVerificationRequestDto request, String ipAddress, String userAgent);

    /**
     * Verify email with token
     * @param token The verification token
     * @param ipAddress Client IP address for security tracking
     * @param userAgent Client user agent for security tracking
     * @return Response indicating success or failure
     */
    EmailVerificationResponseDto verifyEmail(String token, String ipAddress, String userAgent);

    /**
     * Resend verification email for a user
     * @param userId The user ID
     * @param ipAddress Client IP address for security tracking
     * @param userAgent Client user agent for security tracking
     * @return Response indicating success or failure
     */
    EmailVerificationResponseDto resendVerificationEmail(Long userId, String ipAddress, String userAgent);

    /**
     * Check if an email is verified
     * @param email The email address to check
     * @return true if email is verified
     */
    boolean isEmailVerified(String email);

    /**
     * Check if a user's email is verified
     * @param userId The user ID
     * @return true if user's email is verified
     */
    boolean isUserEmailVerified(Long userId);

    /**
     * Validate if a verification token is valid
     * @param token The verification token to validate
     * @return true if token is valid and not expired
     */
    boolean isValidVerificationToken(String token);

    /**
     * Clean up expired tokens (scheduled job)
     * @return Number of tokens cleaned up
     */
    int cleanupExpiredTokens();
}