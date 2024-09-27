import CadastroMenu from '../../components/permissoes';
import Menu from '../../components/menu';
import React from 'react';

export default function PermissoesPage() {
  return (
    <div className="flex h-screen">
        <Menu />
        <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">Permissoes</h1>
        <CadastroMenu />
        </div>
    </div>
  );
}
