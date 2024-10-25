import React from 'react';
import OrcamentoMenuComponente from '../../components/OrcamentoMenuComponente';
import Menu from '../../components/menu';

export default function OrcamentoPage() {
  return (
    <div className="flex h-screen">
        <Menu />
        <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">Orçamentos</h1>
        <OrcamentoMenuComponente />
        </div>
    </div>
  );
}
