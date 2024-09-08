
// src/app/dashboard/page.tsx
import Menu from '../../components/menu'; // Importa o menu

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Inclui o menu no lado esquerdo */}
      <Menu />
      
      {/* Conteúdo principal */}
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-4xl font-bold">Bem-vindo ao Dashboard!</h1>
        <p className="mt-4">Selecione uma opção no menu para navegar.</p>
      </div>
    </div>
  );
}
