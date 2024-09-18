"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/auth';
import ConfirmationModal from './confirmationModal';

export default function Menu() {
  const [drawerOpen, setDrawerOpen] = useState(true); // Estado do menu lateral
  const [activeMenu, setActiveMenu] = useState<string | null>(null); // Controla o submenu ativo
  const [showSubMenu, setShowSubMenu] = useState(false); // Controla se os ícones do submenu são exibidos
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false); // Modal de logout
  const [isContentVisible, setIsContentVisible] = useState(true); // Estado da visibilidade do conteúdo principal
  const authContext = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDrawerOpen(false);
      } else {
        setDrawerOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!authContext) return null;

  const { user, logout, userCan } = authContext;
  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Função que navega para uma página e esconde o submenu
  const goToPage = (route: string) => {
    setShowSubMenu(false); // Esconde o submenu de ícones ao clicar
    router.push(route);
  };

  // Função que renderiza os ícones do submenu na área principal
  const renderSubMenu = (menu: string) => {
    switch (menu) {
      case 'cadastros':
        return (
          <div className="grid grid-cols-4 gap-4 p-4">
            {userCan(['cliente.Read', 'cliente.Write']) && (
              <div onClick={() => goToPage('/cliente')} className="cursor-pointer">
                <div className="bg-gray-200 p-4 rounded-lg shadow hover:bg-gray-300">
                  <span className="material-icons">person</span>
                  <p className="mt-2 text-center">Cliente</p>
                </div>
              </div>
            )}
            {userCan(['empresa.Read', 'empresa.Write']) && (
              <div onClick={() => goToPage('/empresa')} className="cursor-pointer">
                <div className="bg-gray-200 p-4 rounded-lg shadow hover:bg-gray-300">
                  <span className="material-icons">business</span>
                  <p className="mt-2 text-center">Empresa</p>
                </div>
              </div>
            )}
            {userCan(['especialidade.Read', 'especialidade.Write']) && (
              <div onClick={() => goToPage('/especialidade')} className="cursor-pointer">
                <div className="bg-gray-200 p-4 rounded-lg shadow hover:bg-gray-300">
                  <span className="material-icons">queue</span>
                  <p className="mt-2 text-center">Especialidade</p>
                </div>
              </div>
            )}
            {userCan(['setor.Read', 'setor.Write']) && (
              <div onClick={() => goToPage('/setor')} className="cursor-pointer">
                <div className="bg-gray-200 p-4 rounded-lg shadow hover:bg-gray-300">
                  <span className="material-icons">queue</span>
                  <p className="mt-2 text-center">Setor</p>
                </div>
              </div>
            )}
          </div>
        );
      case 'permissoes':
        return (
          <div className="grid grid-cols-4 gap-4 p-4">
            {userCan(['grupoUsuario.Read', 'grupoUsuario.Write']) && (
              <div onClick={() => goToPage('/grupousuario')} className="cursor-pointer">
                <div className="bg-gray-200 p-4 rounded-lg shadow hover:bg-gray-300">
                  <span className="material-icons">group</span>
                  <p className="mt-2 text-center">Grupo de Usuários</p>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Função para lidar com a exibição do submenu e esconder o conteúdo
  const handleMenuClick = (menu: string) => {
    if (activeMenu === menu) {
      // Se clicar no mesmo menu, alterna o estado de exibição
      setShowSubMenu(!showSubMenu);
    } else {
      // Se clicar em outro menu, define o novo submenu e esconde o conteúdo principal
      setActiveMenu(menu);
      setShowSubMenu(true);
      setIsContentVisible(false); // Esconde o conteúdo principal ao clicar no menu
    }
  };

  return (
    <div className="flex">
      {/* Menu lateral */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ${drawerOpen ? 'w-56' : 'w-16'} h-screen fixed md:relative z-40`}
      >
        <div className="p-4">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="focus:outline-none hidden md:block"
          >
            <span className="material-icons text-white">
              {drawerOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        <nav className="flex-grow mt-4">
          <ul>
            {/* Início */}
            <li className="mb-2">
              <button
                onClick={() => goToPage('/dashboard')}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
              >
                <span className="material-icons">home</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Início</span>
              </button>
            </li>

            {/* Grupo Cadastros */}
            <li>
              <button
                onClick={() => handleMenuClick('cadastros')}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
              >
                <span className="material-icons">list_alt</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Cadastros</span>
              </button>
            </li>

            {/* Grupo Permissões */}
            <li>
              <button
                onClick={() => handleMenuClick('permissoes')}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
              >
                <span className="material-icons">lock</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Permissões</span>
              </button>
            </li>

            {/* Logout */}
            <li className="mt-4">
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
              >
                <span className="material-icons">logout</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Sair</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Modal de confirmação de logout */}
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

      {/* Conteúdo principal */}
      <div className={`flex-grow p-4 transition-all duration-300 ${drawerOpen ? 'ml-56' : 'ml-16'}`}>
        {/* Se o conteúdo estiver visível e não houver submenu, renderiza o conteúdo */}
        {isContentVisible && !showSubMenu ? (
          <div className="container mx-auto p-8">
            {/* O conteúdo aqui será ocultado quando o submenu for clicado */}
          </div>
        ) : (
          activeMenu ? renderSubMenu(activeMenu) : null // Se activeMenu for null, não renderiza nada
        )}
      </div>
    </div>
  );
}