 // src/app/auth.tsx
 "use client"; 
import React, { useEffect, useState, createContext, useContext } from 'react';
import axios from './axiosConfig'; // Usa o axios configurado
import { setCookie,getCookie,deleteCookie} from 'cookies-next'; // Um pacote auxiliar para cookies

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
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    //const savedToken = localStorage.getItem('token');
    const savedToken = getCookie('token');
    const savedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

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

      // Salve o token em um cookie
      setCookie('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('permissions', JSON.stringify(data.permissions));
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

    deleteCookie('token'); 

    setUser(null);
  };

  // Verifica as permissões do usuário
  const userCan = (permissions: string[]) => {
    if (!user || !user.permissions) return false;
    const userPermissionsLower = user.permissions.map((perm) => perm.toLowerCase());
    const requiredPermissionsLower = permissions.map((perm) => perm.toLowerCase());
    return requiredPermissionsLower.some((permission) => userPermissionsLower.includes(permission));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, userCan, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acessar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);
