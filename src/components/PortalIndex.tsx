//src/components/PortalIndex.tsx
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
 import { usePortalAuth  } from '../app/authPortal'; // Importa o hook de autenticação
import {
  FaUserAlt,
  FaClipboardList,
  FaCheckCircle,
  FaChartBar,
} from "react-icons/fa";

// Interface para os itens do menu
interface MenuItem {
  permissions: string[];
  label: string;
  icon: React.ReactNode;
  route: string;
}

// Componente de Menu
export default function PortalIndexComponente() {
  const router = useRouter();

   const authContext = usePortalAuth ();
   if (!authContext) {
     return null;
   }

   const { user } = authContext;


   if (!user) {
     router.push('./portal');
     //return null;
   }

  // Definição dos itens de menu
  const menuItems: MenuItem[] = [         
      {
        permissions: ['clienteportal.Read', 'clienteportal.Write'],
        label: 'Meus Dados',
        icon: <FaUserAlt size={24} />,
        route: './Cliente/edit',
      },         
      {
        permissions: ['orcamento.Read', 'orcamento.Write'],
        label: 'Orçamentos/Agendamentos',
        icon: <FaClipboardList size={24} />,
        route: '/pedidos',
      },  
      // {
      //   permissions: ['agendamento.Read', 'agendamento.Write'],
      //   label: 'Agendamentos',
      //   icon: <FaCalendarAlt size={24} />,
      //   route: '/agendamentos',
      // },  
      {
        permissions: ['agendamento.Read', 'agendamento.Write'],
        label: 'Check in',
        icon: <FaCheckCircle size={24} />,
        route: '/agendamentos',
      },    
      {
        permissions: ['agendamento.Read', 'agendamento.Write'],
        label: 'Resultados',
        icon: <FaChartBar size={24} />,
        route: '/agendamentos',
      },                              
  ];

  // Renderiza os itens de menu com base nas permissões
  return (
    <div className="flex flex-col min-h-screen">
      {/* Cabeçalho */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white text-center py-6 shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-wide">PORTAL DO CLIENTE</h1>
        <p className="text-lg mt-2 font-medium">Bem-vindo ao Laboratório São Lucas</p>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow p-4">
        <h2 className="text-lg font-bold mb-4">Selecione uma opção</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {menuItems.map(
            (item) =>
              // userCan(item.permissions) && (
                <div
                  key={item.label}
                  onClick={() => router.push(item.route)}
                  className="cursor-pointer transform transition-transform hover:scale-105"
                >
                  <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-200">
                    <div className="text-primary mb-2">{item.icon}</div>
                    <p className="text-center font-medium text-sm">{item.label}</p>
                  </div>
                </div>
              // )
          )}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-800 text-white text-center py-1 text-xs mt-auto">
        LABORATÓRIO SÃO LUCAS - DEVELOPED BY ASKSYSTEMS
      </footer>
    </div>
  );
}
