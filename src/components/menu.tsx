// src/components/menu.tsx
"use client"; // Necessário porque estamos lidando com eventos e estado no cliente
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importa o hook de navegação do Next.js
import { useAuth } from '../app/auth'; // Importa o hook de autenticação

export default function Menu() {
  const [drawerOpen, setDrawerOpen] = useState(true); // Controla o estado do drawer
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false); // Controla o estado do submenu
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

  // Função para navegar até a página de Grupo de Usuários
  const goToGrupoUsuarios = () => {
    router.push('/grupousuario');
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
        {/* Início */}
        <li className="mb-6">
          <button className="flex items-center px-4 py-2 hover:bg-gray-700 w-full">
            {/* Ícone de início */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M9 21V10H4v11" />
            </svg>
            <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Início</span>
          </button>
        </li>

        {/* Cadastros */}
        <li>
          <button
            onClick={() => setIsCadastrosOpen(!isCadastrosOpen)} // Toggle do submenu
            className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
          >
            {/* Ícone de cadastros */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Cadastros</span>
          </button>

          {/* Submenu de Cadastros */}
          {isCadastrosOpen && (
            <ul className="ml-6 mt-2">
              <li>
                <button
                  onClick={goToGrupoUsuarios}
                  className="flex items-center px-4 py-2 hover:bg-gray-700 w-full text-sm"
                >
                  <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Grupo de Usuários</span>
                </button>
              </li>
            </ul>
          )}
        </li>

        {/* Sair */}
        <li className="mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
          >
            {/* Ícone de sair */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Sair</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
  );
}
