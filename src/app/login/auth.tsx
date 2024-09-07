"use client"; 
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Defina a estrutura esperada para os dados de autenticação
interface User {
  nome: string;
}

interface Permissions {
  // Defina os campos que o objeto de permissões terá
  // Exemplo:
  role: string;
  accessLevel: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: Permissions | null;
  isAuthenticated: () => boolean;
  login: (userData: { Nome: string; token: string; permissions: Permissions }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider de autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const savedToken = localStorage.getItem('token');
    const savedPermissions = JSON.parse(localStorage.getItem('permissions') || 'null');

    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
      setPermissions(savedPermissions);
    }
  }, []);

  const isAuthenticated = () => !!user && !!token;

  const login = (userData: { Nome: string; token: string; permissions: Permissions }) => {
    localStorage.setItem('user', JSON.stringify({ nome: userData.Nome }));
    localStorage.setItem('token', userData.token);
    localStorage.setItem('permissions', JSON.stringify(userData.permissions));

    setUser({ nome: userData.Nome });
    setToken(userData.token);
    setPermissions(userData.permissions);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');

    setUser(null);
    setToken(null);
    setPermissions(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, permissions, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acessar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
