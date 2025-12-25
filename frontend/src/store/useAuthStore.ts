"use client";

import { create } from "zustand";
import { useEffect } from "react";

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  isAuthenticated: false,
  login: (token: string, username: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
    }
    set({ token, username, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    }
    set({ token: null, username: null, isAuthenticated: false });
  },
}));

// Hydrate state from localStorage on client
export const useHydrateAuth = () => {
  const { login } = useAuthStore();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      if (token && username) {
        login(token, username);
      }
    }
  }, [login]);
};
