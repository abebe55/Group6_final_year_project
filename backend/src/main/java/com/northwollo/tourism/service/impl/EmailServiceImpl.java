package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Override
    public boolean sendPasswordResetEmail(String email, String resetLink) {
        // TODO: Implement actual email sending with SMTP
        // For now, just log the email content for development
        log.info("=== PASSWORD RESET EMAIL ===");
        log.info("To: {}", email);
        log.info("Subject: Reset Your Password - North Wollo Tourism");
        log.info("Reset Link: {}", resetLink);
        log.info("=============================");
        
        // Return true to simulate successful sending
        // In production, this would integrate with an SMTP service
        return true;
    }

    @Override
    public boolean sendEmailVerificationEmail(String email, String verificationLink) {
        // TODO: Implement actual email sending with SMTP
        log.info("=== EMAIL VERIFICATION EMAIL ===");
        log.info("To: {}", email);
        log.info("Subject: Verify Your Email - North Wollo Tourism");
        log.info("Verification Link: {}", verificationLink);
        log.info("=================================");
        
        return true;
    }

    @Override
    public boolean sendAccountLockoutEmail(String email, String unlockTime) {
        // TODO: Implement actual email sending with SMTP
        log.info("=== ACCOUNT LOCKOUT EMAIL ===");
        log.info("To: {}", email);
        log.info("Subject: Account Temporarily Locked - North Wollo Tourism");
        log.info("Unlock Time: {}", unlockTime);
        log.info("==============================");
        
        return true;
    }
}