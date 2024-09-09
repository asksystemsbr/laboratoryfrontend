//src/components/menu.tsx
"use client"; // Necessário porque estamos lidando com eventos e estado no cliente
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importa o hook de navegação do Next.js
import { useAuth } from '../app/auth'; // Importa o hook de autenticação
import ConfirmationModal from './confirmationModal'; // Importa a modal de confirmação

export default function Menu() {
  const [drawerOpen, setDrawerOpen] = useState(true); // Controla o estado do drawer
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false); // Controla o estado do submenu
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false); // Estado para a modal de logout
  const authContext = useAuth(); // Usa o contexto de autenticação
  const router = useRouter(); // Inicializa o roteador do Next.js

  if (!authContext) {
    return null; // Se não estiver autenticado, não exibe o menu
  }

  const { user, logout,userCan  } = authContext; // Pega o usuário e a função de logout do contexto

  if (!user) {
    return null; // Se não estiver autenticado, não exibe o menu
  }

  // Função que faz o logout e redireciona para a página de login
  const handleLogout = () => {
    logout(); // Chama a função de logout do contexto
    router.push('/login'); // Redireciona para a página de login
  };

  // Função para navegar até o dashboard
  const goToDashboard = () => {
    router.push('/dashboard');
  };

  // Função para navegar até a página de Grupo de Usuários
  const goToGrupoUsuarios = () => {
    router.push('/grupousuario');
  };

  return (
    <div className={`bg-gray-800 text-white ${drawerOpen ? 'w-56' : 'w-16'} transition-all duration-300 h-full flex flex-col`}>
      <div className="p-4">
        <button onClick={() => setDrawerOpen(!drawerOpen)} className="focus:outline-none">
          <span className="material-icons text-white">menu</span>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-grow overflow-y-auto mt-4"> {/* Permite o scroll apenas no menu quando necessário */}
        <ul>
          {/* Início */}
          <li className="mb-2">
            <button
              onClick={goToDashboard}
              className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
            >
              <span className="material-icons">home</span>
              <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Início</span>
            </button>
          </li>

          {/* Cadastros */}
          <li>
            <button
              onClick={() => setIsCadastrosOpen(!isCadastrosOpen)} // Toggle do submenu
              className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
            >
              <span className="material-icons">list_alt</span>
              <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Cadastros</span>
            </button>

            {/* Submenu de Cadastros */}
            {isCadastrosOpen && (
              <ul className="ml-6 mt-2">
                {userCan(['grupoUsuario.Read', 'grupoUsuario.Write']) && ( // Verifica as permissões
                    <li>
                    <button
                        onClick={goToGrupoUsuarios}
                        className="flex items-center px-4 py-2 hover:bg-gray-700 w-full text-sm"
                    >
                        <span className="material-icons">group</span>
                        <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Grupo de Usuários</span>
                    </button>
                    </li>
                )}
              </ul>
            )}
          </li>

          {/* Sair */}
          <li className="mt-4">
            <button
              onClick={() => setIsLogoutConfirmOpen(true)} // Abre modal de confirmação
              className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
            >
              <span className="material-icons">logout</span>
              <span className={`ml-4 ${!drawerOpen && 'hidden'}`}>Sair</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Modal de confirmação para logout */}
      <ConfirmationModal
        isOpen={isLogoutConfirmOpen}
        title="Confirmar Logout"
        message="Tem certeza de que deseja sair?"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        confirmText="Sair"
        cancelText="Cancelar"
      />
    </div>
  );
}