package com.northwollo.tourism.dto.response;

public class AuthResponseDto {

    private String token;
    private String tokenType = "Bearer";

    public AuthResponseDto(String token) {
        this.token = token;
    }

    // getters
}
