// frontend/src/types/auth.ts

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
}

export interface ResetPasswordRequestDto {
  email: string;
}
