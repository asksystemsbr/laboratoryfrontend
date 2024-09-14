//src/components/menu.tsx
"use client"; // Necessário porque estamos lidando com eventos e estado no cliente
import { useState, useEffect  } from 'react';
import { useRouter } from 'next/navigation'; // Importa o hook de navegação do Next.js
import { useAuth } from '../app/auth'; // Importa o hook de autenticação
import ConfirmationModal from './confirmationModal'; // Importa a modal de confirmação

//import { ReactNode } from 'react'; // Importa o tipo ReactNode

// interface MenuProps {
//   children: ReactNode; // Define o tipo de children como ReactNode
// }

export default function Menu() {
  const [drawerOpen, setDrawerOpen] = useState(true); // O menu começa expandido por padrão no desktop
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const authContext = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Colapsa o menu automaticamente no mobile (telas menores)
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDrawerOpen(false); // Colapsado no mobile
      } else {
        setDrawerOpen(true); // Expandido no desktop
      }
    };

    window.addEventListener('resize', handleResize);

    // Executa uma vez para garantir o estado inicial correto
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!authContext) {
    return null;
  }

  const { user, logout, userCan } = authContext;

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToGrupoUsuarios = () => {
    router.push('/grupousuario');
  };

  const goToClientes = () => {
    router.push('/cliente');
  };

  const goToEmpresas = () => {
    router.push('/empresa');
  };
  
  const goToEsoecialidade = () => {
    router.push('/especialidade');
  };


  return (
    <div className="flex">
      {/* Botão de abrir/fechar menu - visível apenas em telas pequenas */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="p-4 text-white bg-gray-800 md:hidden fixed top-0 left-0 z-50"
      >
        <span className="material-icons">
          {drawerOpen ? 'menu_open' : 'menu'}
        </span>
      </button>

      {/* Menu Lateral - ajustado para mobile e desktop */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ${
          drawerOpen ? 'w-56' : 'w-16'
        } h-screen fixed md:relative z-40`}
      >
        {/* Botão para abrir/fechar o menu - visível apenas em telas grandes */}
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

        <nav className="flex-grow overflow-y-auto mt-4">
          <ul>
            <li className="mb-2">
              <button
                onClick={goToDashboard}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
              >
                <span className="material-icons">home</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Início</span>
              </button>
            </li>

            <li>
            <button
                onClick={() => {
                  console.log("Abrindo/fechando Cadastros");
                  setIsCadastrosOpen(!isCadastrosOpen);
                }}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
              >
                <span className="material-icons">list_alt</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Cadastros</span>
              </button>


              {isCadastrosOpen && (
                <ul className="ml-6 mt-2">
                  {userCan(['grupoUsuario.Read', 'grupoUsuario.Write']) && (
                    <li>
                      <button
                        onClick={goToGrupoUsuarios}
                        className="flex items-center px-4 py-2 hover:bg-gray-700 w-full text-sm"
                      >
                        <span className="material-icons">group</span>
                        <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>
                          Grupo de Usuários
                        </span>
                      </button>
                    </li>
                  )}
                  {userCan(['cliente.Read', 'cliente.Write']) && (
                    <li>
                      <button
                        onClick={goToClientes}
                        className="flex items-center px-4 py-2 hover:bg-gray-700 w-full text-sm"
                      >
                        <span className="material-icons">person</span>
                        <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>
                          Cliente
                        </span>
                      </button>
                    </li>
                  )}
                   {userCan(['empresa.Read', 'empresa.Write']) && (
                    <li>
                      <button
                        onClick={goToEmpresas}
                        className="flex items-center px-4 py-2 hover:bg-gray-700 w-full text-sm"
                      >
                        <span className="material-icons">business</span>
                        <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>
                          Empresa
                        </span>
                      </button>
                    </li>
                  )}
                  {userCan(['especialidade.Read', 'especialidade.Write']) && (
                    <li>
                      <button
                        onClick={goToEsoecialidade}
                        className="flex items-center px-4 py-2 hover:bg-gray-700 w-full text-sm"
                      >
                        <span className="material-icons">biotech</span>
                        <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>
                          Especialidade
                        </span>
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </li>

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

      {/* Conteúdo Principal */}
      <div className={`flex-grow p-4 ${drawerOpen ? 'ml-25' : 'ml-16'} transition-all duration-300`}>
        {/* Aqui vai o conteúdo principal */}
      </div>
    </div>
  );
}