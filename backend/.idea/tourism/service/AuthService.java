package com.northwollo.tourism.service;

import com.northwollo.tourism.dto.request.LoginRequestDto;
import com.northwollo.tourism.dto.request.UserRegisterDto;
import com.northwollo.tourism.dto.response.AuthResponseDto;

public interface AuthService {

    AuthResponseDto login(LoginRequestDto dto);

    void register(UserRegisterDto dto);
}
