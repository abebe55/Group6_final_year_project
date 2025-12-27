package com.northwollo.tourism.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetResponseDto {

    private String message;
    private boolean success;

    public static PasswordResetResponseDto success(String message) {
        return new PasswordResetResponseDto(message, true);
    }

    public static PasswordResetResponseDto error(String message) {
        return new PasswordResetResponseDto(message, false);
    }
}