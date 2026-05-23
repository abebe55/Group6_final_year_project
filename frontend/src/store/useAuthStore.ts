"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { refreshToken as refreshTokenAPI, logout as logoutAPI } from "../services/auth.service";

export type UserRole = "CLIENT" | "HOTEL_OWNER" | "ADMIN";
export type BrowsingMode = "CLIENT" | "OWNER";

interface JwtPayload {
  sub: string;
  userId: number;
  roles: string[];
  exp: number;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  username: string | null;
  userId: number | null;
  role: UserRole | null;
  browsingMode: BrowsingMode;  // NEW: For HOTEL_OWNER to switch between client/owner mode
  isAuthenticated: boolean;
  emailVerified: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateEmailVerified: (verified: boolean) => void;
  refreshAccessToken: () => Promise<boolean>;
  isTokenExpired: () => boolean;
  getTimeUntilExpiry: () => number;
  setBrowsingMode: (mode: BrowsingMode) => void;  // NEW: Switch browsing mode
  isOwnerMode: () => boolean;  // NEW: Check if in owner mode
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  username: null,
  userId: null,
  role: null,
  browsingMode: "CLIENT",  // Default to client mode
  isAuthenticated: false,
  emailVerified: false,
  isLoading: false,

  login: (token: string, refreshToken?: string, userIdFromResponse?: number) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const role = decoded.roles[0]?.replace("ROLE_", "") as UserRole;
      
      // Use userId from JWT if available, otherwise use the one from response
      const userId = decoded.userId || userIdFromResponse || null;

      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (userId) {
        localStorage.setItem("userId", String(userId));
      }

      // Restore browsing mode from localStorage if HOTEL_OWNER
      const savedMode = localStorage.getItem("browsingMode") as BrowsingMode;
      const browsingMode = (role === "HOTEL_OWNER" && savedMode) ? savedMode : "CLIENT";

      set({
        token,
        refreshToken: refreshToken || null,
        username: decoded.sub,
        userId,
        role,
        browsingMode,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('✅ Auth store updated:', { username: decoded.sub, role, userId, browsingMode });
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      get().logout();
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    
    set({ isLoading: true });
    
    try {
      // Call logout API to revoke refresh token
      await logoutAPI(refreshToken || undefined);
    } catch (error) {
      console.error('❌ Logout API error:', error);
    }

    // Clear state and localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("browsingMode");
    
    set({
      token: null,
      refreshToken: null,
      username: null,
      userId: null,
      role: null,
      browsingMode: "CLIENT",
      isAuthenticated: false,
      emailVerified: false,
      isLoading: false,
    });

    console.log('✅ Logged out successfully');
  },

  updateEmailVerified: (verified: boolean) => {
    set({ emailVerified: verified });
  },

  // NEW: Set browsing mode (for HOTEL_OWNER to switch between client/owner)
  setBrowsingMode: (mode: BrowsingMode) => {
    const { role } = get();
    // Only HOTEL_OWNER can switch modes
    if (role === "HOTEL_OWNER") {
      localStorage.setItem("browsingMode", mode);
      set({ browsingMode: mode });
      console.log('✅ Browsing mode changed to:', mode);
    }
  },

  // NEW: Check if currently in owner mode
  isOwnerMode: (): boolean => {
    const { role, browsingMode } = get();
    return role === "HOTEL_OWNER" && browsingMode === "OWNER";
  },

  refreshAccessToken: async (): Promise<boolean> => {
    const { refreshToken: currentRefreshToken } = get();
    
    if (!currentRefreshToken) {
      console.log('❌ No refresh token available');
      return false;
    }

    try {
      console.log('🔄 Refreshing access token...');
      const response = await refreshTokenAPI(currentRefreshToken);
      
      // Update tokens
      const newToken = response.accessToken;
      const newRefreshToken = response.refreshToken;
      
      localStorage.setItem("token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      // Decode new token and update state
      const decoded = jwtDecode<JwtPayload>(newToken);
      const role = decoded.roles[0]?.replace("ROLE_", "") as UserRole;

      set({
        token: newToken,
        refreshToken: newRefreshToken || currentRefreshToken,
        username: decoded.sub,
        userId: decoded.userId,
        role,
        isAuthenticated: true,
      });

      console.log('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // If refresh fails, logout user
      await get().logout();
      return false;
    }
  },

  isTokenExpired: (): boolean => {
    const { token } = get();
    if (!token) return true;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('❌ Failed to decode token for expiry check:', error);
      return true;
    }
  },

  getTimeUntilExpiry: (): number => {
    const { token } = get();
    if (!token) return 0;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return Math.max(0, decoded.exp - currentTime);
    } catch (error) {
      console.error('❌ Failed to decode token for expiry time:', error);
      return 0;
    }
  },
}));

// Hydration hook with automatic token refresh
export const useHydrateAuth = () => {
  const { login, refreshAccessToken, isTokenExpired, logout } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const storedUserId = localStorage.getItem("userId");
      const userIdFromStorage = storedUserId ? parseInt(storedUserId, 10) : undefined;
      
      if (token) {
        // Check if token is expired
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            console.log('🔄 Token expired, attempting refresh...');
            // Token is expired, try to refresh
            if (refreshToken) {
              const refreshed = await refreshAccessToken();
              if (!refreshed) {
                console.log('❌ Token refresh failed, logging out');
                await logout();
              }
            } else {
              console.log('❌ No refresh token, logging out');
              await logout();
            }
          } else {
            // Token is still valid
            login(token, refreshToken || undefined, userIdFromStorage);
          }
        } catch (error) {
          console.error('❌ Token validation error:', error);
          await logout();
        }
      }
    };

    initializeAuth();
  }, [login, refreshAccessToken, logout]);
};

// Auto-refresh hook - automatically refresh token before expiry
export const useAutoRefresh = () => {
  const { isAuthenticated, getTimeUntilExpiry, refreshAccessToken, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndRefresh = async () => {
      const timeUntilExpiry = getTimeUntilExpiry();
      
      // Refresh token if it expires in less than 5 minutes (300 seconds)
      if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
        console.log('🔄 Token expiring soon, refreshing...');
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          console.log('❌ Auto-refresh failed, logging out');
          await logout();
        }
      }
    };

    // Check immediately
    checkAndRefresh();

    // Set up interval to check every minute
    const interval = setInterval(checkAndRefresh, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, getTimeUntilExpiry, refreshAccessToken, logout]);
};
