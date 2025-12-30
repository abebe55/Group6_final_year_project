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
import com.northwollo.tourism.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public AuthResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.isActive()) {
            throw new BadCredentialsException("User is inactive. Contact admin.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponseDto(token);
    }

    @Override
    public void register(UserRegisterDto dto) {

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        Role role = roleRepository.findByName("CLIENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role CLIENT not found"));

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName()); // ✅ THIS FIXES THE ERROR
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRoles(Set.of(role));
        user.setActive(true);

        userRepository.save(user);
    }


}
