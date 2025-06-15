
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  phone: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user session in localStorage
    const savedUser = localStorage.getItem('tsGramSevaUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (phone: string, name: string) => {
    const userData = { phone, name, isVerified: true };
    setUser(userData);
    localStorage.setItem('tsGramSevaUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tsGramSevaUser');
  };

  const isAuthenticated = user?.isVerified || false;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
