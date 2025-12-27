package com.northwollo.tourism.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationResponseDto {

    private String message;
    private boolean success;

    public static EmailVerificationResponseDto success(String message) {
        return new EmailVerificationResponseDto(message, true);
    }

    public static EmailVerificationResponseDto error(String message) {
        return new EmailVerificationResponseDto(message, false);
    }
}