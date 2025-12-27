package com.northwollo.tourism.service;

public interface EmailService {

    /**
     * Send password reset email
     * @param email Recipient email address
     * @param resetLink Password reset link
     * @return true if email was sent successfully
     */
    boolean sendPasswordResetEmail(String email, String resetLink);

    /**
     * Send email verification email
     * @param email Recipient email address
     * @param verificationLink Email verification link
     * @return true if email was sent successfully
     */
    boolean sendEmailVerificationEmail(String email, String verificationLink);

    /**
     * Send account lockout notification
     * @param email Recipient email address
     * @param unlockTime When the account will be unlocked
     * @return true if email was sent successfully
     */
    boolean sendAccountLockoutEmail(String email, String unlockTime);
}