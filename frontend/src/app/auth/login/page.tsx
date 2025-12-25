"use client";

import { useState } from "react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export default function LoginForm({ onSuccess, onRegisterClick }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      console.log('🚀 Attempting login:', { username });
      const res = await login({ username, password });
      console.log('✅ Login success:', res);
      
      // ✅ SAFE ACCESS: res = { token: "eyJhbGciOiJIUzUxMiJ9..." }
      if (res?.token) {
        console.log('🔐 Saving token to store:', res.token.substring(0, 20) + '...');
        auth.login(res.token, username);
        onSuccess?.();
      } else {
        throw new Error("Invalid login response - no token received");
      }
    } catch (err: any) {
      console.error("❌ Login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-72 mx-auto p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Login</h2>

      <div className="space-y-1">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          disabled={loading}
          autoComplete="username"
        />
      </div>

      <div className="space-y-1">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          disabled={loading}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !username.trim() || !password.trim()}
        className={`w-full p-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
          loading || !username.trim() || !password.trim()
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
        }`}
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Logging in...</span>
          </>
        ) : (
          <span>Login</span>
        )}
      </button>

      <button
        type="button"
        onClick={onRegisterClick}
        disabled={loading}
        className="w-full p-3 border-2 border-green-600 text-green-600 bg-white rounded-lg font-semibold hover:bg-green-50 hover:border-green-700 hover:text-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        Create Account
      </button>
    </form>
  );
}
