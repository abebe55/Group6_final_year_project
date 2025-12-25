"use client";

import { useState } from "react";
import { resetPassword } from "@/services/auth.service";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      // ✅ Call reset password API
      await resetPassword({ email });
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (err: any) {
      // ✅ Check for response from fetch or axios
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Failed to reset password");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-72">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <button
        type="submit"
        className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition"
      >
        Reset Password
      </button>
    </form>
  );
}
