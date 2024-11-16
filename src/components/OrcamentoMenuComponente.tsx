"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/auth'; // Importa o hook de autenticação

// Interface para os itens do menu
interface MenuItem {
  permissions: string[];
  label: string;
  icon: string;
  route: string;
}

// Componente de Menu
export default function OrcamentoMenuComponente() {
  const router = useRouter();

  const authContext = useAuth();
  if (!authContext) {
    return null;
  }

  const { user, userCan } = authContext;


  if (!user) {
    return null;
  }

  // Definição dos itens de menu
  const menuItems: MenuItem[] = [         
      {
        permissions: ['orcamento.Read', 'orcamento.Write'],
        label: 'Orçamentos',
        icon: 'queue',
        route: '/orcamentos',
      },         
      {
        permissions: ['orcamento.Read', 'orcamento.Write'],
        label: 'Pedidos',
        icon: 'queue',
        route: '/pedidos',
      },                            
  ];

  // Renderiza os itens de menu com base nas permissões
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {menuItems.map(
        (item) =>
          userCan(item.permissions) && (
            <div
              key={item.label}
              onClick={() => router.push(item.route)}
              className="cursor-pointer"
            >
              <div className="bg-gray-200 p-4 rounded-lg shadow hover:bg-gray-300">
                <span className="material-icons">{item.icon}</span>
                <p className="mt-2 text-center">{item.label}</p>
              </div>
            </div>
          )
      )}
    </div>
  );
}
