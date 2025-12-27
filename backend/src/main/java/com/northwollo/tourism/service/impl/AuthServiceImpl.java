package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.request.LoginRequestDto;
import com.northwollo.tourism.dto.request.UserRegisterDto;
import com.northwollo.tourism.dto.response.AuthResponseDto;
import com.northwollo.tourism.entity.Role;
import com.northwollo.tourism.entity.User;
import com.northwollo.tourism.exception.BadRequestException;
import com.northwollo.tourism.exception.ResourceNotFoundException;
import com.northwollo.tourism.repository.RoleRepository;
import com.northwollo.tourism.repository.UserRepository;
import com.northwollo.tourism.security.JwtTokenProvider;
import com.northwollo.tourism.service.AccountSecurityService;
import com.northwollo.tourism.service.AuthService;
import com.northwollo.tourism.service.EmailVerificationService;
import com.northwollo.tourism.service.TokenRefreshService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailVerificationService emailVerificationService;
    private final TokenRefreshService tokenRefreshService;
    private final AccountSecurityService accountSecurityService;

    @Value("${app.email-verification.required-for-login:false}")
    private boolean emailVerificationRequiredForLogin;

    @Value("${app.jwt.expiration:86400000}")
    private long accessTokenExpiration;

    @Override
    public AuthResponseDto login(LoginRequestDto dto) {
        // Call the overloaded method with null IP tracking (for backward compatibility)
        return login(dto, null, null);
    }

    @Override
    public AuthResponseDto login(LoginRequestDto dto, String ipAddress, String userAgent) {
        String credential = dto.getUsername(); // This can be username or email
        
        // Security checks before attempting login
        if (ipAddress != null) {
            // Check if IP should be blocked
            if (accountSecurityService.shouldBlockIpAddress(ipAddress)) {
                accountSecurityService.recordLoginAttempt(credential, false, ipAddress, userAgent, null, "IP_BLOCKED");
                throw new BadCredentialsException("Too many attempts from this IP address. Please try again later.");
            }

            // Check if identifier should be blocked
            if (accountSecurityService.shouldBlockIdentifier(credential, ipAddress)) {
                accountSecurityService.recordLoginAttempt(credential, false, ipAddress, userAgent, null, "IDENTIFIER_BLOCKED");
                throw new BadCredentialsException("Too many failed attempts. Please try again later.");
            }

            // Apply progressive delay
            int delay = accountSecurityService.getProgressiveDelay(credential, ipAddress);
            if (delay > 0) {
                try {
                    Thread.sleep(delay * 1000L); // Convert to milliseconds
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        User user = null;
        
        // Determine if credential is email or username and find user accordingly
        try {
            if (isEmail(credential)) {
                user = userRepository.findByEmail(credential.toLowerCase().trim())
                        .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
            } else {
                user = userRepository.findByUsername(credential)
                        .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
            }
        } catch (BadCredentialsException e) {
            // Record failed attempt - user not found
            if (ipAddress != null) {
                accountSecurityService.recordLoginAttempt(credential, false, ipAddress, userAgent, null, "USER_NOT_FOUND");
            }
            throw e;
        }

        // Check if user account is locked
        if (accountSecurityService.isUserLockedOut(user.getId())) {
            if (ipAddress != null) {
                accountSecurityService.recordLoginAttempt(credential, false, ipAddress, userAgent, user.getId(), "ACCOUNT_LOCKED");
            }
            throw new BadCredentialsException("Account is temporarily locked due to security reasons. Please try again later.");
        }

        if (!user.isActive()) {
            if (ipAddress != null) {
                accountSecurityService.recordLoginAttempt(credential, false, ipAddress, userAgent, user.getId(), "ACCOUNT_INACTIVE");
            }
            throw new BadCredentialsException("User is inactive. Contact admin.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            if (ipAddress != null) {
                accountSecurityService.recordLoginAttempt(credential, false, ipAddress, userAgent, user.getId(), "INVALID_PASSWORD");
            }
            throw new BadCredentialsException("Invalid credentials or password");
        }

        // Check email verification if required
        if (emailVerificationRequiredForLogin && !user.isEmailVerified()) {
            if (ipAddress != null) {
                accountSecurityService.recordLoginAttempt(credential, false, ipAddress, userAgent, user.getId(), "EMAIL_NOT_VERIFIED");
            }
            throw new BadCredentialsException("Please verify your email address before logging in.");
        }

        // Successful login - record it
        if (ipAddress != null) {
            accountSecurityService.recordLoginAttempt(credential, true, ipAddress, userAgent, user.getId(), null);
        }

        String accessToken = jwtTokenProvider.generateToken(user);
        
        // Generate refresh token if IP address is provided
        if (ipAddress != null) {
            String deviceInfo = extractDeviceInfo(userAgent);
            String refreshToken = tokenRefreshService.generateRefreshToken(user.getId(), ipAddress, userAgent, deviceInfo);
            return new AuthResponseDto(accessToken, refreshToken, accessTokenExpiration / 1000);
        } else {
            // Backward compatibility - return only access token
            return new AuthResponseDto(accessToken);
        }
    }

    /**
     * Check if a string is a valid email format
     */
    private boolean isEmail(String credential) {
        return credential != null && credential.contains("@") && credential.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    /**
     * Extract device information from user agent
     */
    private String extractDeviceInfo(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Unknown Device";
        }
        
        // Simple device detection - can be enhanced with a proper library
        if (userAgent.contains("Mobile") || userAgent.contains("Android") || userAgent.contains("iPhone")) {
            return "Mobile Device";
        } else if (userAgent.contains("Tablet") || userAgent.contains("iPad")) {
            return "Tablet";
        } else {
            return "Desktop";
        }
    }

    @Override
    @Transactional
    public void register(UserRegisterDto dto) {
        // Call the overloaded method with null IP tracking (for backward compatibility)
        register(dto, null, null);
    }

    @Override
    @Transactional
    public void register(UserRegisterDto dto, String ipAddress, String userAgent) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role role = roleRepository.findByName("CLIENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role CLIENT not found"));

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail().toLowerCase().trim());
        user.setFullName(dto.getFullName());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRoles(Set.of(role));
        user.setActive(true);
        user.setEmailVerified(false); // New users need to verify email

        User savedUser = userRepository.save(user);

        // Send email verification if IP address is provided
        if (ipAddress != null) {
            try {
                com.northwollo.tourism.dto.request.EmailVerificationRequestDto verificationRequest = 
                    new com.northwollo.tourism.dto.request.EmailVerificationRequestDto(user.getEmail());
                emailVerificationService.sendVerificationEmail(verificationRequest, ipAddress, userAgent);
            } catch (Exception e) {
                // Log error but don't fail registration
                log.error("Failed to send verification email for user: {}", savedUser.getId(), e);
            }
        }
    }


}
