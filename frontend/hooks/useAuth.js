import { useState } from "react";
import { apiRequest } from "../utils/api";

export default function useAuth() {
  const [token, setToken] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null
  );

  const login = async (username, password) => {
    const data = await apiRequest("/auth/login", "POST", {
      username,
      password,
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return { token, login, logout };
}
