// src/services/auth.service.ts - ✅ FULLY COMPLETE
import { api } from "./api";
import { API_BASE_URL } from "./api";  // ✅ MISSING IMPORT ADDED

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

interface ResetPasswordRequest {
  email: string;
}

// ✅ FIXED: Direct fetch (bypasses api wrapper for auth)
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  console.log('🔐 LOGIN REQUEST → /auth/login', data);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ LOGIN ERROR:', response.status, errorText);
      throw new Error(errorText || `Login failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ LOGIN RESPONSE:', result);
    
    // ✅ Backend returns { token: "..." } directly
    return result;  // { token: "eyJhbGciOiJIUzUxMiJ9..." }
  } catch (error) {
    console.error('❌ LOGIN NETWORK ERROR:', error);
    throw error;
  }
};

// ✅ REGISTER
export const register = async (data: RegisterRequest): Promise<any> => {
  console.log('🔐 REGISTER → /auth/register', data);
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Registration failed");
  }
  return response.json();
};

// ✅ RESET PASSWORD
export const resetPassword = async (data: ResetPasswordRequest): Promise<any> => {
  console.log('🔐 RESET → /auth/reset-password', data);
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Reset failed");
  }
  return response.json();
};
