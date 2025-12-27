package com.northwollo.tourism.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // Disable CSRF (JWT based)
                .csrf(csrf -> csrf.disable())

                // No sessions (stateless API)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Handle unauthorized access
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(authenticationEntryPoint))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        /* =======================
                           🔓 PUBLIC ENDPOINTS
                           ======================= */
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/search/**").permitAll()

                        // Public GET endpoints for tourism (homepage & search)
                        .requestMatchers(HttpMethod.GET, "/api/tourisms/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/map-points/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/guiders/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ratings/**").permitAll()

                        /* =======================
                           👤 AUTHENTICATED USERS
                           ======================= */
                        .requestMatchers(HttpMethod.POST, "/api/ratings/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/ratings/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/ratings/**").authenticated()

                        .requestMatchers("/api/client/**").authenticated()
                        .requestMatchers("/api/bookings/**").authenticated()
                        .requestMatchers("/api/user/**").authenticated()

                        /* =======================
                           👮 ADMIN ONLY
                           ======================= */
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        /* =======================
                           🔐 EVERYTHING ELSE
                           ======================= */
                        .anyRequest().authenticated()
                )

                // JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Authentication manager
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
