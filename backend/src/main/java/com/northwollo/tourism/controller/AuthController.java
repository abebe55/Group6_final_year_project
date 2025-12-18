package com.northwollo.tourism.controller;

import com.northwollo.tourism.dto.request.LoginRequestDto;
import com.northwollo.tourism.dto.request.UserRegisterDto;
import com.northwollo.tourism.dto.response.AuthResponseDto;
import com.northwollo.tourism.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid @RequestBody UserRegisterDto dto) {
        authService.register(dto);
        return ResponseEntity.ok().build();
    }
}
