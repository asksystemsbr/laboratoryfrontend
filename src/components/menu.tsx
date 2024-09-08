// src/components/menu.tsx
"use client"; // Necessário porque estamos lidando com eventos e estado no cliente
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importa o hook de navegação do Next.js
import { useAuth } from '../app/auth'; // Importa o hook de autenticação

export default function Menu() {
  const [drawerOpen, setDrawerOpen] = useState(true); // Controla o estado do drawer
  const authContext = useAuth(); // Usa o contexto de autenticação
  const router = useRouter(); // Inicializa o roteador do Next.js

  if (!authContext) {
    return null; // Se não estiver autenticado, não exibe o menu
  }

  const { user, logout } = authContext; // Pega o usuário e a função de logout do contexto

  if (!user) {
    return null; // Se não estiver autenticado, não exibe o menu
  }
  
    // Função que faz o logout e redireciona para a página de login
    const handleLogout = () => {
        logout(); // Chama a função de logout do contexto
        router.push('/login'); // Redireciona para a página de login
      };

  return (
    <div className={`bg-gray-800 text-white ${drawerOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
      <div className="p-4">
        <button onClick={() => setDrawerOpen(!drawerOpen)} className="focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-2">
        <ul>
          <li className="mb-6">
            <button className="flex items-center px-4 py-2 hover:bg-gray-700 w-full">
              <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Início</span>
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout} // Chama o logout do AuthContext
              className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
            >
              <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Sair</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
