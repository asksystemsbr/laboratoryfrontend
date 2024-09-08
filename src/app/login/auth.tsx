 "use client"; 
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// // Defina a estrutura esperada para os dados de autenticação
// interface User {
//   nome: string;
// }

// interface Permissions {
//   // Defina os campos que o objeto de permissões terá
//   // Exemplo:
//   role: string;
//   accessLevel: number;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   permissions: Permissions | null;
//   isAuthenticated: () => boolean;
//   login: (userData: { Nome: string; token: string; permissions: Permissions }) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Provider de autenticação
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [permissions, setPermissions] = useState<Permissions | null>(null);

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
//     const savedToken = localStorage.getItem('token');
//     const savedPermissions = JSON.parse(localStorage.getItem('permissions') || 'null');

//     if (savedUser && savedToken) {
//       setUser(savedUser);
//       setToken(savedToken);
//       setPermissions(savedPermissions);
//     }
//   }, []);

//   const isAuthenticated = () => !!user && !!token;

//   const login = (userData: { Nome: string; token: string; permissions: Permissions }) => {
//     localStorage.setItem('user', JSON.stringify({ nome: userData.Nome }));
//     localStorage.setItem('token', userData.token);
//     localStorage.setItem('permissions', JSON.stringify(userData.permissions));

//     setUser({ nome: userData.Nome });
//     setToken(userData.token);
//     setPermissions(userData.permissions);
//   };

//   const logout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     localStorage.removeItem('permissions');

//     setUser(null);
//     setToken(null);
//     setPermissions(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, permissions, isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Hook para acessar o contexto de autenticação
// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


// src/app/login/auth.tsx
import { useEffect, useState, createContext, useContext } from 'react';
import axios from '../axiosConfig'; // Usa o axios configurado

// Define o tipo do usuário
type User = {
  id: number;
  nome: string;
  senha: string;
  token: string;
  permissions: string[];
};

// Define o tipo do contexto de autenticação
type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  userCan: (permissions: string[]) => boolean;
  loading: boolean;
};

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Tipagem explícita do user
  const [loading, setLoading] = useState(true);

  // Função para carregar o usuário a partir do token
  const loadUserFromToken = async () => {
    //const token = localStorage.getItem('token');
    // if (token) {
    //   try {
    //     const { data } = await axios.get('/auth/me', {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     setUser(data.user); // Define o usuário logado
    //   } catch (error) {
    //     console.error('Erro ao carregar usuário', error);
    //   }
    // }
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const savedToken = localStorage.getItem('token');
    const savedPermissions = JSON.parse(localStorage.getItem('permissions') || 'null');

    if (savedUser && savedToken) {
      // Reconstrói o objeto user
      const user = {
        id: savedUser.id,
        nome: savedUser.nome,
        senha: '', // Não há necessidade de armazenar a senha, isso deve ser tratado no backend
        token: savedToken,
        permissions: savedPermissions,
      };
        // Atualiza o estado do usuário
        setUser(user);
        setLoading(false);
      } else {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  // Função de login
  const login = async (username: string, password: string) => {
    try {
      const { data } = await axios.post('/api/Usuarios/authenticate', {
        Nome: username,
        Senha: password,
        token: '',
        permissions:[]
      });

      const user = {
        id: data.id,
        nome: data.nome,
        senha: '', // Não salve a senha por questões de segurança, coloque apenas se for necessário
        token: data.token,
        permissions: data.permissions,
      };

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('permissions', data.permissions);
      setUser(user); // Armazena o usuário autenticado
    } catch (error) {
      console.error('Erro no login', error);
      throw error;
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');

    setUser(null);
  };

  // Verifica as permissões do usuário
  const userCan = (permissions: string[]) => {
    if (!user || !user.permissions) return false;
    return permissions.some((permission) => user.permissions.includes(permission));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, userCan, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acessar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);
