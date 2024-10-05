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
export default function CadastroMenu() {
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
      permissions: ['cliente.Read', 'cliente.Write'],
      label: 'Cliente',
      icon: 'person',
      route: '/cliente',
    },
    {
      permissions: ['empresa.Read', 'empresa.Write'],
      label: 'Empresa',
      icon: 'business',
      route: '/empresa',
    },
    {
      permissions: ['especialidade.Read', 'especialidade.Write'],
      label: 'Especialidade',
      icon: 'queue',
      route: '/especialidade',
    },
    {
      permissions: ['setor.Read', 'setor.Write'],
      label: 'Setor',
      icon: 'queue',
      route: '/setor',
    },
    {
        permissions: ['modalidade.Read', 'modalidade.Write'],
        label: 'Modalidade',
        icon: 'queue',
        route: '/modalidade',
      },
      {
        permissions: ['recipienteamostra.Read', 'recipienteamostra.Write'],
        label: 'Recipiente Amostra',
        icon: 'queue',
        route: '/recipienteAmostra',
      },  
      {
        permissions: ['rotinaexame.Read', 'rotinaexame.Write'],
        label: 'Rotina de Exame',
        icon: 'queue',
        route: '/rotinaExame',
      },
      {
        permissions: ['metodoExame.Read', 'metodoExame.Write'],
        label: 'Método de Exame',
        icon: 'queue',
        route: '/metodoExame',
      },
      {
        permissions: ['materialApoio.Read', 'materialApoio.Write'],
        label: 'Material de Apoio',
        icon: 'queue',
        route: '/materialApoio',
      },
      {
        permissions: ['exame.Read', 'exame.Write'],
        label: 'Exame',
        icon: 'queue',
        route: '/exame',
      },
      // {
      //   permissions: ['exameApoio.Read', 'exameApoio.Write'],
      //   label: 'Exame de Apoio',
      //   icon: 'queue',
      //   route: '/exameApoio',
      // },
      {
        permissions: ['laboratorioApoio.Read', 'laboratorioApoio.Write'],
        label: 'Laboratório de Apoio',
        icon: 'queue',
        route: '/laboratorioApoio',
      },  
      {
        permissions: ['convenio.Read', 'convenio.Write'],
        label: 'Convênios',
        icon: 'queue',
        route: '/convenio',
      },       
      // {
      //   permissions: ['plano.Read', 'plano.Write'],
      //   label: 'Planos',
      //   icon: 'queue',
      //   route: '/plano',
      // },     
      {
        permissions: ['recepcao.Read', 'recepcao.Write'],
        label: 'Recepções',
        icon: 'queue',
        route: '/recepcao',
      },     
      {
        permissions: ['solicitante.Read', 'solicitante.Write'],
        label: 'Solicitante',
        icon: 'queue',
        route: '/solicitante',
      },  
      {
        permissions: ['tabelaPreco.Read', 'tabelaPreco.Write'],
        label: 'Tabela Preço',
        icon: 'queue',
        route: '/tabelaPreco',
      },
      {
        permissions: ['Plano.Read', 'Plano.Write'],
        label: 'Plano',
        icon: 'queue',
        route: '/plano',
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
