import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiRequest } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await apiRequest('/auth/login', 'POST', { username, password });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ username }));
    
    setToken(data.token);
    setUser({ username });
    
    return data;
  };

  const register = async (userData) => {
    await apiRequest('/auth/register', 'POST', userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
