"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/auth';
import ConfirmationModal from './confirmationModal';

// Componente para os itens do menu
const MenuItem = ({ icon, label, route, canAccess, drawerOpen, goToPage }: { icon: string, label: string, route: string, canAccess: boolean, drawerOpen: boolean, goToPage: (route: string) => void }) => {
  if (!canAccess) return null;

  return (
    <li>
      <button
        onClick={() => goToPage(route)}
        className="flex items-center px-4 py-2 hover:bg-gray-700 w-full text-sm"
        title={label} // Adiciona tooltip quando o menu estiver colapsado
      >
        <span className="material-icons">{icon}</span>
        <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>{label}</span>
      </button>
    </li>
  );
};

export default function Menu() {
  const [drawerOpen, setDrawerOpen] = useState(false); // Começa colapsado
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
  const [isPermissoesOpen, setIsPermissoesOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const authContext = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDrawerOpen(false); // Colapsado no mobile
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Executa ao carregar para ajustar conforme o tamanho
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!authContext) {
    return null;
  }

  const { user, logout, userCan } = authContext;
  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const goToPage = (route: string) => {
    setDrawerOpen(false); // Fecha o menu no mobile
    router.push(route);
  };

  return (
    <div className="flex">
      {/* Botão para abrir/fechar menu */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="p-4 text-white bg-gray-800 md:hidden fixed top-0 left-0 z-50"
      >
        <span className="material-icons">
          {drawerOpen ? 'menu_open' : 'menu'}
        </span>
      </button>

      {/* Menu Lateral */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ${drawerOpen ? 'w-3/4 md:w-56' : 'w-16'} h-screen fixed md:relative z-40 overflow-y-auto`}
      >
        {/* Botão para expandir ou colapsar no desktop */}
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
            <MenuItem icon="home" label="Início" route="/dashboard" canAccess={true} drawerOpen={drawerOpen} goToPage={goToPage} />

            {/* Grupo Cadastros */}
            <li>
              <button
                onClick={() => setIsCadastrosOpen(!isCadastrosOpen)}
                aria-expanded={isCadastrosOpen}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
                title={drawerOpen ? '' : 'Cadastros'}
              >
                <span className="material-icons">list_alt</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Cadastros</span>
                {drawerOpen && (
                  <span className="ml-auto">
                    <span className="material-icons">
                      {isCadastrosOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </span>
                )}
              </button>

              {isCadastrosOpen && (
                <ul className="ml-6 mt-2">
                  <MenuItem icon="person" label="Cliente" route="/cliente" canAccess={userCan(['cliente.Read', 'cliente.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="business" label="Empresa" route="/empresa" canAccess={userCan(['empresa.Read', 'empresa.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Especialidade" route="/especialidade" canAccess={userCan(['especialidade.Read', 'especialidade.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Setor" route="/setor" canAccess={userCan(['setor.Read', 'setor.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Modalidade" route="/modalidade" canAccess={userCan(['modalidade.Read', 'modalidade.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Recipiente Amostra" route="/recipienteAmostra" canAccess={userCan(['recipienteamostra.Read', 'recipienteamostra.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Rotina de Exame" route="/rotinaExame" canAccess={userCan(['rotinaexame.Read', 'rotinaexame.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Método de Exame" route="/metodoExame" canAccess={userCan(['metodoExame.Read', 'metodoExame.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Material de Apoio" route="/materialApoio" canAccess={userCan(['materialApoio.Read', 'materialApoio.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Exame de Apoio" route="/exameApoio" canAccess={userCan(['exameApoio.Read', 'exameApoio.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                  <MenuItem icon="queue" label="Laboratório de Apoio" route="/laboratorioApoio" canAccess={userCan(['laboratorioApoio.Read', 'laboratorioApoio.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                </ul>
              )}
            </li>

            {/* Grupo Permissões */}
            <li>
              <button
                onClick={() => setIsPermissoesOpen(!isPermissoesOpen)}
                aria-expanded={isPermissoesOpen}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
                title={drawerOpen ? '' : 'Permissões'}
              >
                <span className="material-icons">lock</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Permissões</span>
                {drawerOpen && (
                  <span className="ml-auto">
                    <span className="material-icons">
                      {isPermissoesOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </span>
                )}
              </button>

              {isPermissoesOpen && (
                <ul className="ml-6 mt-2">
                  <MenuItem icon="group" label="Grupo de Usuários" route="/grupousuario" canAccess={userCan(['grupoUsuario.Read', 'grupoUsuario.Write'])} drawerOpen={drawerOpen} goToPage={goToPage} />
                </ul>
              )}
            </li>

            {/* Opção Sair */}
            <li className="mt-4">
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="flex items-center px-4 py-2 hover:bg-gray-700 w-full"
                title={drawerOpen ? '' : 'Sair'}
              >
                <span className="material-icons">logout</span>
                <span className={`ml-4 ${!drawerOpen ? 'hidden' : 'block'}`}>Sair</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Modal de Confirmação de Logout */}
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
      <div className={`flex-grow p-4 ${drawerOpen ? 'ml-42' : 'ml-16'} transition-all duration-300`}>
        {/* Conteúdo aqui */}
      </div>
    </div>
  );
}